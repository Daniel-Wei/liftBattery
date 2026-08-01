using System.ComponentModel.DataAnnotations;
using LiftBattery.Api.Data;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Entities;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportScheduleService : IWeeklyReportSchedulingService
{
    private const int DefaultDispatchBatchSize = 100;
    private const int DefaultDispatchLeaseMinutes = 10;

    private readonly IWeeklyReportScheduleRepository _scheduleRepository;
    private readonly IWeeklyReportQueue _queue;
    private readonly LiftBatteryDbContext _dbContext;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WeeklyReportScheduleService> _logger;
    private readonly int _dispatchBatchSize;
    private readonly TimeSpan _dispatchLeaseDuration;

    public WeeklyReportScheduleService(
        IWeeklyReportScheduleRepository scheduleRepository,
        IWeeklyReportQueue queue,
        LiftBatteryDbContext dbContext,
        TimeProvider timeProvider,
        IConfiguration configuration,
        ILogger<WeeklyReportScheduleService> logger)
    {
        _scheduleRepository = scheduleRepository;
        _queue = queue;
        _dbContext = dbContext;
        _timeProvider = timeProvider;
        _logger = logger;
        _dispatchBatchSize = Math.Max(
            1,
            configuration.GetValue("WeeklyReportDispatchBatchSize", DefaultDispatchBatchSize));
        _dispatchLeaseDuration = TimeSpan.FromMinutes(Math.Max(
            1,
            configuration.GetValue("WeeklyReportDispatchLeaseMinutes", DefaultDispatchLeaseMinutes)));
    }

    public async Task<WeeklyReportScheduleDto> GetForUserAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);
        var schedule = await _scheduleRepository.GetByUserIdAsync(userId, cancellationToken);

        if (schedule is null)
        {
            var now = _timeProvider.GetUtcNow();
            schedule = await _scheduleRepository.UpsertForUserAsync(
                new WeeklyReportSchedule
                {
                    ScheduleId = CreateDefaultScheduleId(userId),
                    UserId = userId,
                    Enabled = false,
                    DayOfWeek = DayOfWeek.Monday,
                    LocalSendTime = new TimeOnly(8, 0),
                    TimeZoneId = WeeklyReportConstants.DefaultTimeZoneId,
                    RecipientEmail = await GetUserEmailAsync(userId, cancellationToken),
                    CreatedAtUtc = now,
                    UpdatedAtUtc = now,
                },
                cancellationToken);
        }

        return ToDto(schedule);
    }

    public async Task<WeeklyReportScheduleDto> SaveForUserAsync(
        int userId,
        UpdateWeeklyReportScheduleRequestDto request,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);
        var existing = await _scheduleRepository.GetByUserIdAsync(userId, cancellationToken);
        var now = _timeProvider.GetUtcNow();
        var dayOfWeek = ParseDayOfWeek(request.DayOfWeek)
            ?? existing?.DayOfWeek
            ?? DayOfWeek.Monday;
        var localSendTime = ParseTimeOfDay(request.TimeOfDay);
        var timeZoneId = NormalizeTimeZoneId(request.TimeZoneId);
        var nextRunAtUtc = request.Enabled
            ? CalculateNextRunUtc(dayOfWeek, localSendTime, timeZoneId, now)
            : (DateTimeOffset?)null;

        // Editing the time shortly after this period was sent can otherwise schedule
        // the same PeriodKey again later today. Skip directly to the next occurrence.
        if (nextRunAtUtc is not null
            && string.Equals(
                GetReportPeriod(nextRunAtUtc.Value, timeZoneId).Key,
                existing?.LastPeriodKey,
                StringComparison.Ordinal))
        {
            nextRunAtUtc = CalculateNextRunUtc(
                dayOfWeek,
                localSendTime,
                timeZoneId,
                nextRunAtUtc.Value.AddSeconds(1));
        }

        // UpsertForUserAsync and SaveChangesAsync form the SQL transaction boundary:
        // either every setting (including NextRunAtUtc) becomes visible, or none does.
        var schedule = await _scheduleRepository.UpsertForUserAsync(
            new WeeklyReportSchedule
            {
                ScheduleId = existing?.ScheduleId ?? CreateDefaultScheduleId(userId),
                UserId = userId,
                Enabled = request.Enabled,
                DayOfWeek = dayOfWeek,
                LocalSendTime = localSendTime,
                TimeZoneId = timeZoneId,
                RecipientEmail = NormalizeEmail(request.RecipientEmail),
                LastRunAtUtc = existing?.LastRunAtUtc,
                LastPeriodKey = existing?.LastPeriodKey,
                NextRunAtUtc = nextRunAtUtc,
                CreatedAtUtc = existing?.CreatedAtUtc ?? now,
                UpdatedAtUtc = now,
            },
            cancellationToken);

        return ToDto(schedule);
    }

    public async Task ProcessDueSchedulesAsync(CancellationToken cancellationToken = default)
    {
        var now = _timeProvider.GetUtcNow();
        var dispatcherId = $"{Environment.MachineName}:{Guid.NewGuid():N}";

        // ClaimDueAsync performs a narrow indexed schedule query followed by an
        // atomic conditional UPDATE per candidate. Only winning Timer instances
        // receive a claim and are allowed to publish a message.
        var claims = await _scheduleRepository.ClaimDueAsync(
            now,
            now.Add(_dispatchLeaseDuration),
            dispatcherId,
            _dispatchBatchSize,
            cancellationToken);

        foreach (var claim in claims)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var schedule = claim.Schedule;
            var period = GetReportPeriod(
                schedule.NextRunAtUtc
                    ?? throw new InvalidOperationException("A claimed schedule must have NextRunAtUtc."),
                schedule.TimeZoneId);

            // Persisting the period on the claimed row lets worker completion advance
            // only the exact dispatch it is completing, without putting claim details
            // or user data into Service Bus.
            if (!await _scheduleRepository.SetClaimedPeriodAsync(
                schedule.ScheduleId,
                claim.ClaimToken,
                period.Key,
                cancellationToken))
            {
                continue;
            }

            try
            {
                await _queue.EnqueueAsync(
                    new WeeklyReportQueueMessageDto(schedule.ScheduleId, period.Key),
                    cancellationToken);

                _logger.LogInformation(
                    "Weekly report schedule dispatched. ScheduleId={ScheduleId}, UserId={UserId}, PeriodKey={PeriodKey}.",
                    schedule.ScheduleId,
                    schedule.UserId,
                    period.Key);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                // No message was published successfully, so release immediately rather
                // than waiting ten minutes for the dispatcher lease to expire.
                await _scheduleRepository.ReleaseClaimAsync(
                    schedule.ScheduleId,
                    claim.ClaimToken,
                    cancellationToken);
                _logger.LogError(
                    exception,
                    "Weekly report dispatch failed; claim released. ScheduleId={ScheduleId}, PeriodKey={PeriodKey}.",
                    schedule.ScheduleId,
                    period.Key);
            }
        }
    }

    internal static DateTimeOffset CalculateNextRunUtc(
        DayOfWeek dayOfWeek,
        TimeOnly localSendTime,
        string? timeZoneId,
        DateTimeOffset afterUtc)
    {
        var timezone = GetTimeZone(timeZoneId);
        var localAfter = TimeZoneInfo.ConvertTime(afterUtc, timezone);
        var candidateDate = DateOnly.FromDateTime(localAfter.Date);
        var daysUntil = ((int)dayOfWeek - (int)localAfter.DayOfWeek + 7) % 7;
        var candidateLocal = candidateDate
            .AddDays(daysUntil)
            .ToDateTime(localSendTime);

        if (candidateLocal <= localAfter.DateTime)
        {
            candidateLocal = candidateLocal.AddDays(7);
        }

        // A configured wall-clock time can fall inside the skipped hour at the start
        // of daylight saving. Move to the first valid hour instead of persisting an
        // impossible local occurrence. Ambiguous fall-back times use the platform's
        // deterministic standard-time conversion.
        if (timezone.IsInvalidTime(candidateLocal))
        {
            candidateLocal = candidateLocal.AddHours(1);
        }

        var utc = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(candidateLocal, DateTimeKind.Unspecified),
            timezone);
        return new DateTimeOffset(utc, TimeSpan.Zero);
    }

    internal static WeeklyReportPeriod GetReportPeriod(
        DateTimeOffset scheduledForUtc,
        string? timeZoneId)
    {
        var localScheduled = TimeZoneInfo.ConvertTime(scheduledForUtc, GetTimeZone(timeZoneId));
        var periodEnd = DateOnly.FromDateTime(localScheduled.Date).AddDays(-1);
        return new WeeklyReportPeriod(periodEnd.AddDays(-6), periodEnd);
    }

    private async Task<string> GetUserEmailAsync(int userId, CancellationToken cancellationToken)
    {
        var email = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.Email)
            .SingleOrDefaultAsync(cancellationToken);

        return string.IsNullOrWhiteSpace(email)
            ? throw new UnauthorizedAccessException("Authentication is required.")
            : email;
    }

    private static DayOfWeek? ParseDayOfWeek(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : Enum.TryParse<DayOfWeek>(value.Trim(), true, out var parsed)
                ? parsed
                : throw new ArgumentException("DayOfWeek is invalid.");
    }

    private static TimeOnly ParseTimeOfDay(string value)
    {
        if (!TimeOnly.TryParse(value, out var parsed))
        {
            throw new ArgumentException("TimeOfDay must use HH:mm format.");
        }

        return new TimeOnly(parsed.Hour, parsed.Minute);
    }

    private static string NormalizeEmail(string value)
    {
        var email = value.Trim();
        return new EmailAddressAttribute().IsValid(email)
            ? email
            : throw new ArgumentException("Recipient email format is invalid.");
    }

    private static string NormalizeTimeZoneId(string? value)
    {
        var timeZoneId = string.IsNullOrWhiteSpace(value)
            ? WeeklyReportConstants.DefaultTimeZoneId
            : value.Trim();

        try
        {
            _ = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return timeZoneId;
        }
        catch (Exception exception) when (exception is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            throw new ArgumentException("TimeZoneId is invalid.", nameof(value), exception);
        }
    }

    private static TimeZoneInfo GetTimeZone(string? timeZoneId)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(
                string.IsNullOrWhiteSpace(timeZoneId)
                    ? WeeklyReportConstants.DefaultTimeZoneId
                    : timeZoneId);
        }
        catch (Exception exception) when (exception is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            return TimeZoneInfo.Utc;
        }
    }

    private static string CreateDefaultScheduleId(int userId) => $"weekly-report-user-{userId}";

    private static void ValidateUserId(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentException("User id must be positive.");
        }
    }

    private static WeeklyReportScheduleDto ToDto(WeeklyReportSchedule schedule)
    {
        return new WeeklyReportScheduleDto(
            schedule.ScheduleId,
            schedule.UserId,
            schedule.Enabled,
            schedule.DayOfWeek.ToString(),
            schedule.LocalSendTime.ToString("HH:mm"),
            schedule.RecipientEmail,
            schedule.TimeZoneId,
            schedule.LastRunAtUtc,
            schedule.NextRunAtUtc,
            schedule.LastPeriodKey,
            schedule.CreatedAtUtc,
            schedule.UpdatedAtUtc);
    }
}
