using System.ComponentModel.DataAnnotations;
using LiftBattery.Api.Data;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportScheduleService : IWeeklyReportSchedulingService
{
    private readonly IWeeklyReportScheduleRepository _scheduleRepository;
    private readonly IWeeklyReportJobService _jobService;
    private readonly LiftBatteryDbContext _dbContext;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WeeklyReportScheduleService> _logger;

    public WeeklyReportScheduleService(
        IWeeklyReportScheduleRepository scheduleRepository,
        IWeeklyReportJobService jobService,
        LiftBatteryDbContext dbContext,
        TimeProvider timeProvider,
        ILogger<WeeklyReportScheduleService> logger)
    {
        _scheduleRepository = scheduleRepository;
        _jobService = jobService;
        _dbContext = dbContext;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<WeeklyReportScheduleDto> GetForUserAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        var document = await _scheduleRepository.GetByUserIdAsync(userId, cancellationToken);

        if (document is not null)
        {
            return ToDto(document.Schedule);
        }

        var userEmail = await GetUserEmailAsync(userId, cancellationToken);
        var now = _timeProvider.GetUtcNow();
        var schedule = new WeeklyReportSchedule
        {
            ScheduleId = CreateDefaultScheduleId(userId),
            UserId = userId,
            Enabled = false,
            DayOfWeek = DayOfWeek.Monday,
            TimeOfDay = new TimeOnly(8, 0),
            TimeZoneId = WeeklyReportConstants.DefaultTimeZoneId,
            RecipientEmail = userEmail,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        schedule = await _scheduleRepository.UpsertForUserAsync(
            schedule,
            cancellationToken: cancellationToken);
        return ToDto(schedule);
    }

    public async Task<WeeklyReportScheduleDto> SaveForUserAsync(
        int userId,
        UpdateWeeklyReportScheduleRequestDto request,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        var document = await _scheduleRepository.GetByUserIdAsync(userId, cancellationToken);
        var now = _timeProvider.GetUtcNow();
        var dayOfWeek = ParseDayOfWeek(request.DayOfWeek) ?? document?.Schedule.DayOfWeek ?? DayOfWeek.Monday;
        var timeOfDay = ParseTimeOfDay(request.TimeOfDay);
        var timeZoneId = NormalizeTimeZoneId(request.TimeZoneId);
        var schedule = new WeeklyReportSchedule
        {
            ScheduleId = document?.Schedule.ScheduleId ?? CreateDefaultScheduleId(userId),
            UserId = userId,
            Enabled = request.Enabled,
            DayOfWeek = dayOfWeek,
            TimeOfDay = timeOfDay,
            TimeZoneId = timeZoneId,
            RecipientEmail = NormalizeEmail(request.RecipientEmail),
            LastRunAtUtc = document?.Schedule.LastRunAtUtc,
            NextRunAtUtc = request.Enabled
                ? CalculateNextRunUtc(dayOfWeek, timeOfDay, timeZoneId, now)
                : null,
            LastRunKey = document?.Schedule.LastRunKey,
            LastRequestedJobId = document?.Schedule.LastRequestedJobId,
            CreatedAtUtc = document?.Schedule.CreatedAtUtc ?? now,
            UpdatedAtUtc = now,
        };

        schedule = await _scheduleRepository.UpsertForUserAsync(
            schedule,
            document?.ETag,
            cancellationToken);
        return ToDto(schedule);
    }

    public async Task ProcessDueSchedulesAsync(CancellationToken cancellationToken = default)
    {
        var now = _timeProvider.GetUtcNow();
        _logger.LogInformation("Weekly report schedule scan started. NowUtc={NowUtc}.", now);

        var documents = await _scheduleRepository.GetEnabledAsync(cancellationToken);

        foreach (var document in documents)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var schedule = document.Schedule;

            if (!TryGetDueRun(schedule, now, out var scheduledForUtc, out var runKey))
            {
                _logger.LogDebug(
                    "Weekly report schedule skipped. ScheduleId={ScheduleId}, UserId={UserId}, NextRunAtUtc={NextRunAtUtc}.",
                    schedule.ScheduleId,
                    schedule.UserId,
                    schedule.NextRunAtUtc);
                continue;
            }

            _logger.LogInformation(
                "Weekly report schedule due. ScheduleId={ScheduleId}, UserId={UserId}, RunKey={RunKey}, ScheduledForUtc={ScheduledForUtc}.",
                schedule.ScheduleId,
                schedule.UserId,
                runKey,
                scheduledForUtc);

            WeeklyReportJobDto job;

            try
            {
                job = await _jobService.RequestScheduledWeeklyReportAsync(
                    schedule.UserId,
                    schedule.ScheduleId,
                    scheduledForUtc,
                    schedule.RecipientEmail,
                    schedule.TimeZoneId ?? WeeklyReportConstants.DefaultTimeZoneId,
                    cancellationToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                _logger.LogError(
                    exception,
                    "Weekly report job request failed. ScheduleId={ScheduleId}, UserId={UserId}, RunKey={RunKey}, ScheduledForUtc={ScheduledForUtc}.",
                    schedule.ScheduleId,
                    schedule.UserId,
                    runKey,
                    scheduledForUtc);
                continue;
            }

            var updatedSchedule = CopySchedule(schedule, new WeeklyReportScheduleUpdate
            {
                LastRunAtUtc = scheduledForUtc,
                NextRunAtUtc = CalculateNextRunUtc(
                    schedule.DayOfWeek,
                    schedule.TimeOfDay,
                    schedule.TimeZoneId,
                    scheduledForUtc.AddSeconds(1)),
                LastRunKey = runKey,
                LastRequestedJobId = job.Id,
                UpdatedAtUtc = now,
            });

            if (await _scheduleRepository.TryUpdateAsync(updatedSchedule, document.ETag, cancellationToken))
            {
                _logger.LogInformation(
                    "Weekly report schedule metadata updated. ScheduleId={ScheduleId}, UserId={UserId}, RunKey={RunKey}, JobId={JobId}, NextRunAtUtc={NextRunAtUtc}.",
                    schedule.ScheduleId,
                    schedule.UserId,
                    runKey,
                    job.Id,
                    updatedSchedule.NextRunAtUtc);
            }
            else
            {
                _logger.LogInformation(
                    "Weekly report schedule metadata update skipped after ETag conflict. ScheduleId={ScheduleId}, UserId={UserId}, RunKey={RunKey}, JobId={JobId}.",
                    schedule.ScheduleId,
                    schedule.UserId,
                    runKey,
                    job.Id);
            }
        }
    }

    internal static bool TryGetDueRun(
        WeeklyReportSchedule schedule,
        DateTimeOffset nowUtc,
        out DateTimeOffset scheduledForUtc,
        out string runKey)
    {
        scheduledForUtc = schedule.NextRunAtUtc ?? default;
        runKey = string.Empty;

        if (!schedule.Enabled || schedule.NextRunAtUtc is null || schedule.NextRunAtUtc > nowUtc)
        {
            return false;
        }

        runKey = CreateRunKey(schedule.ScheduleId, scheduledForUtc);
        return !string.Equals(schedule.LastRunKey, runKey, StringComparison.Ordinal);
    }

    internal static DateTimeOffset CalculateNextRunUtc(
        DayOfWeek dayOfWeek,
        TimeOnly timeOfDay,
        string? timeZoneId,
        DateTimeOffset afterUtc)
    {
        var timezone = GetTimeZone(timeZoneId);
        var localAfter = TimeZoneInfo.ConvertTime(afterUtc, timezone);
        var candidateDate = DateOnly.FromDateTime(localAfter.Date);

        var daysUntil = ((int)dayOfWeek - (int)localAfter.DayOfWeek + 7) % 7;
        candidateDate = candidateDate.AddDays(daysUntil);
        var candidateLocal = candidateDate.ToDateTime(timeOfDay);

        if (candidateLocal <= localAfter.DateTime)
        {
            candidateLocal = candidateLocal.AddDays(7);
        }

        return new DateTimeOffset(candidateLocal, timezone.GetUtcOffset(candidateLocal)).ToUniversalTime();
    }

    private async Task<string> GetUserEmailAsync(int userId, CancellationToken cancellationToken)
    {
        var userEmail = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.Email)
            .SingleOrDefaultAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(userEmail))
        {
            throw new UnauthorizedAccessException("Authentication is required.");
        }

        return userEmail;
    }

    private static WeeklyReportSchedule CopySchedule(
        WeeklyReportSchedule schedule,
        WeeklyReportScheduleUpdate update)
    {
        return new WeeklyReportSchedule
        {
            ScheduleId = schedule.ScheduleId,
            UserId = schedule.UserId,
            Enabled = schedule.Enabled,
            DayOfWeek = schedule.DayOfWeek,
            TimeOfDay = schedule.TimeOfDay,
            TimeZoneId = schedule.TimeZoneId,
            RecipientEmail = schedule.RecipientEmail,
            LastRunAtUtc = update.LastRunAtUtc ?? schedule.LastRunAtUtc,
            NextRunAtUtc = update.NextRunAtUtc ?? schedule.NextRunAtUtc,
            LastRunKey = update.LastRunKey ?? schedule.LastRunKey,
            LastRequestedJobId = update.LastRequestedJobId ?? schedule.LastRequestedJobId,
            CreatedAtUtc = schedule.CreatedAtUtc,
            UpdatedAtUtc = update.UpdatedAtUtc ?? schedule.UpdatedAtUtc,
        };
    }

    private static string CreateDefaultScheduleId(int userId)
    {
        return $"weekly-report-user-{userId}";
    }

    private static string CreateRunKey(string scheduleId, DateTimeOffset scheduledForUtc)
    {
        return $"{scheduleId}:{scheduledForUtc:O}";
    }

    private static DayOfWeek? ParseDayOfWeek(string? dayOfWeek)
    {
        return string.IsNullOrWhiteSpace(dayOfWeek)
            ? null
            : Enum.TryParse<DayOfWeek>(dayOfWeek.Trim(), ignoreCase: true, out var parsed)
                ? parsed
                : throw new ArgumentException("DayOfWeek is invalid.");
    }

    private static TimeOnly ParseTimeOfDay(string timeOfDay)
    {
        if (!TimeOnly.TryParse(timeOfDay, out var parsed))
        {
            throw new ArgumentException("TimeOfDay must use HH:mm format.");
        }

        return new TimeOnly(parsed.Hour, parsed.Minute);
    }

    private static string NormalizeEmail(string email)
    {
        var normalized = email.Trim();
        var validator = new EmailAddressAttribute();

        if (!validator.IsValid(normalized))
        {
            throw new ArgumentException("Recipient email format is invalid.");
        }

        return normalized;
    }

    private static string NormalizeTimeZoneId(string? timeZoneId)
    {
        var normalized = string.IsNullOrWhiteSpace(timeZoneId)
            ? WeeklyReportConstants.DefaultTimeZoneId
            : timeZoneId.Trim();
        _ = GetTimeZone(normalized);
        return normalized;
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
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.Utc;
        }
        catch (InvalidTimeZoneException)
        {
            return TimeZoneInfo.Utc;
        }
    }

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
            schedule.TimeOfDay.ToString("HH:mm"),
            schedule.RecipientEmail,
            schedule.TimeZoneId ?? WeeklyReportConstants.DefaultTimeZoneId,
            schedule.LastRunAtUtc,
            schedule.NextRunAtUtc,
            schedule.LastRunKey,
            schedule.LastRequestedJobId,
            schedule.CreatedAtUtc,
            schedule.UpdatedAtUtc);
    }

    private sealed class WeeklyReportScheduleUpdate
    {
        public DateTimeOffset? LastRunAtUtc { get; init; }
        public DateTimeOffset? NextRunAtUtc { get; init; }
        public string? LastRunKey { get; init; }
        public int? LastRequestedJobId { get; init; }
        public DateTimeOffset? UpdatedAtUtc { get; init; }
    }
}
