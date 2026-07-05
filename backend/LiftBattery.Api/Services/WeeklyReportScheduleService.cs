using System.ComponentModel.DataAnnotations;
using LiftBattery.Api.Data;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportScheduleService : IWeeklyReportScheduleService
{
    private readonly IWeeklyReportRepository _repository;
    private readonly IWeeklyReportQueue _queue;
    private readonly ITrendReportService _trendReportService;
    private readonly IWeeklyReportPdfGenerator _pdfGenerator;
    private readonly IWeeklyReportBlobStorage _blobStorage;
    private readonly IEmailSender _emailSender;
    private readonly LiftBatteryDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public WeeklyReportScheduleService(
        IWeeklyReportRepository repository,
        IWeeklyReportQueue queue,
        ITrendReportService trendReportService,
        IWeeklyReportPdfGenerator pdfGenerator,
        IWeeklyReportBlobStorage blobStorage,
        IEmailSender emailSender,
        LiftBatteryDbContext dbContext,
        TimeProvider timeProvider)
    {
        _repository = repository;
        _queue = queue;
        _trendReportService = trendReportService;
        _pdfGenerator = pdfGenerator;
        _blobStorage = blobStorage;
        _emailSender = emailSender;
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<WeeklyReportScheduleDto> GetForUserAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);
        var schedule = await _repository.GetScheduleAsync(userId);

        if (schedule is not null)
        {
            return ToDto(schedule);
        }

        var userEmail = await GetUserEmailAsync(userId, cancellationToken);
        var now = _timeProvider.GetUtcNow();
        schedule = new WeeklyReportSchedule(
            userId,
            false,
            new TimeOnly(8, 0),
            userEmail,
            "UTC",
            WeeklyReportConstants.ReportType,
            now,
            now,
            WeeklyReportConstants.DataVersion);
        schedule = await _repository.UpsertScheduleAsync(schedule);
        return ToDto(schedule);
    }

    public async Task<WeeklyReportScheduleDto> SaveForUserAsync(
        int userId,
        UpdateWeeklyReportScheduleRequestDto request,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);
        var scheduledTime = ParseScheduledTime(request.ScheduledTime);
        var recipientEmail = NormalizeEmail(request.RecipientEmail);
        var timezone = NormalizeTimezone(request.Timezone);
        var existing = await _repository.GetScheduleAsync(userId);
        var now = _timeProvider.GetUtcNow();
        var schedule = new WeeklyReportSchedule(
            userId,
            request.Enabled,
            scheduledTime,
            recipientEmail,
            timezone,
            WeeklyReportConstants.ReportType,
            existing?.CreatedAtUtc ?? now,
            now,
            WeeklyReportConstants.DataVersion);

        schedule = await _repository.UpsertScheduleAsync(schedule);
        return ToDto(schedule);
    }

    public async Task EnqueueDueReportsAsync(CancellationToken cancellationToken = default)
    {
        var schedules = await _repository.GetEnabledSchedulesAsync();
        var nowUtc = _timeProvider.GetUtcNow();

        foreach (var schedule in schedules)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (!TryGetDueWeek(schedule, nowUtc, out var weekStartDate, out var weekEndDate))
            {
                continue;
            }

            var idempotencyKey = CreateIdempotencyKey(
                schedule.UserId,
                schedule.ReportType,
                weekStartDate,
                schedule.DataVersion);
            var existingJob = await _repository.GetJobAsync(idempotencyKey);

            if (existingJob is not null)
            {
                continue;
            }

            var correlationId = $"weekly-report:{schedule.UserId}:{weekStartDate:yyyy-MM-dd}:v{schedule.DataVersion}:{Guid.NewGuid():N}";
            var job = new WeeklyReportJob(
                idempotencyKey,
                schedule.UserId,
                schedule.ReportType,
                weekStartDate,
                weekEndDate,
                schedule.ScheduledTime.ToString("HH:mm"),
                schedule.Timezone,
                schedule.RecipientEmail,
                schedule.DataVersion,
                WeeklyReportJobStatuses.Pending,
                correlationId,
                nowUtc,
                nowUtc,
                nowUtc,
                null,
                null,
                null,
                null,
                null,
                null);
            job = await _repository.CreateJobIfNotExistsAsync(job);

            if (job.Status == WeeklyReportJobStatuses.Pending)
            {
                await _queue.EnqueueAsync(ToQueueMessage(job));
            }
        }
    }

    public async Task ProcessAsync(
        WeeklyReportQueueMessageDto queueMessage,
        CancellationToken cancellationToken = default)
    {
        ValidateQueueMessage(queueMessage);
        var job = await _repository.TryStartProcessingAsync(
            queueMessage.IdempotencyKey,
            _timeProvider.GetUtcNow());

        if (job is null)
        {
            return;
        }

        try
        {
            if (job.DataVersion != queueMessage.DataVersion
                || job.UserId != queueMessage.UserId
                || !string.Equals(job.RecipientEmail, queueMessage.RecipientEmail, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var reportRequest = new CreateTrendReportRequestDto(
                queueMessage.WeekStartDate,
                queueMessage.WeekStartDate,
                null,
                null);
            var result = await _trendReportService.GenerateResultAsync(queueMessage.UserId, reportRequest);
            var pdfBytes = _pdfGenerator.GeneratePdf(result, queueMessage.DataVersion, queueMessage.CorrelationId);
            var generatedAt = _timeProvider.GetUtcNow();
            var blobName = await _blobStorage.UploadAsync(
                queueMessage.UserId,
                queueMessage.WeekStartDate,
                queueMessage.WeekEndDate,
                queueMessage.DataVersion,
                queueMessage.CorrelationId,
                pdfBytes,
                cancellationToken);

            job = job with
            {
                Status = WeeklyReportJobStatuses.Generated,
                BlobName = blobName,
                GeneratedAtUtc = generatedAt,
                UpdatedAtUtc = generatedAt,
                Result = result,
            };
            await _repository.UpdateJobAsync(job);

            await _emailSender.SendAsync(
                queueMessage.RecipientEmail,
                $"LiftOps 每周趋势报告 {queueMessage.WeekStartDate} - {queueMessage.WeekEndDate}",
                "你好，附件是你的 LiftOps 每周趋势报告。",
                new EmailAttachment(
                    $"weekly-trends-report-{queueMessage.WeekStartDate}.pdf",
                    "application/pdf",
                    pdfBytes),
                cancellationToken);

            var sentAt = _timeProvider.GetUtcNow();
            await _repository.UpdateJobAsync(job with
            {
                Status = WeeklyReportJobStatuses.Sent,
                SentAtUtc = sentAt,
                UpdatedAtUtc = sentAt,
            });
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            var failedAt = _timeProvider.GetUtcNow();
            await _repository.UpdateJobAsync(job with
            {
                Status = WeeklyReportJobStatuses.Failed,
                ErrorMessage = exception.Message,
                UpdatedAtUtc = failedAt,
            });
            throw;
        }
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

    private static bool TryGetDueWeek(
        WeeklyReportSchedule schedule,
        DateTimeOffset nowUtc,
        out DateOnly weekStartDate,
        out DateOnly weekEndDate)
    {
        var timezone = GetTimeZone(schedule.Timezone);
        var localNow = TimeZoneInfo.ConvertTime(nowUtc, timezone);
        weekStartDate = default;
        weekEndDate = default;

        if (localNow.DayOfWeek != DayOfWeek.Monday
            || TimeOnly.FromDateTime(localNow.DateTime) < schedule.ScheduledTime)
        {
            return false;
        }

        var currentMonday = DateOnly.FromDateTime(localNow.Date);
        weekStartDate = currentMonday.AddDays(-7);
        weekEndDate = currentMonday.AddDays(-1);
        return true;
    }

    private static TimeZoneInfo GetTimeZone(string timezone)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timezone);
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

    private static WeeklyReportQueueMessageDto ToQueueMessage(WeeklyReportJob job)
    {
        return new WeeklyReportQueueMessageDto(
            job.DataVersion,
            WeeklyReportConstants.MessageType,
            job.UserId,
            job.ReportType,
            job.WeekStartDate.ToString("yyyy-MM-dd"),
            job.WeekEndDate.ToString("yyyy-MM-dd"),
            job.ScheduledTime,
            job.Timezone,
            job.RecipientEmail,
            job.IdempotencyKey,
            job.CorrelationId,
            job.RequestedAtUtc);
    }

    private static string CreateIdempotencyKey(
        int userId,
        string reportType,
        DateOnly weekStartDate,
        int dataVersion)
    {
        return $"{userId}:{reportType}:{weekStartDate:yyyy-MM-dd}:v{dataVersion}";
    }

    private static TimeOnly ParseScheduledTime(string scheduledTime)
    {
        if (!TimeOnly.TryParse(scheduledTime, out var parsed))
        {
            throw new ArgumentException("Scheduled time must use HH:mm format.");
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

    private static string NormalizeTimezone(string? timezone)
    {
        return string.IsNullOrWhiteSpace(timezone)
            ? "UTC"
            : timezone.Trim();
    }

    private static void ValidateQueueMessage(WeeklyReportQueueMessageDto queueMessage)
    {
        if (queueMessage.DataVersion <= 0
            || queueMessage.UserId <= 0
            || queueMessage.MessageType != WeeklyReportConstants.MessageType
            || queueMessage.ReportType != WeeklyReportConstants.ReportType
            || string.IsNullOrWhiteSpace(queueMessage.WeekStartDate)
            || string.IsNullOrWhiteSpace(queueMessage.WeekEndDate)
            || string.IsNullOrWhiteSpace(queueMessage.IdempotencyKey)
            || string.IsNullOrWhiteSpace(queueMessage.CorrelationId)
            || string.IsNullOrWhiteSpace(queueMessage.RecipientEmail))
        {
            throw new ArgumentException("Weekly report queue message is invalid.");
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
            schedule.UserId,
            schedule.Enabled,
            schedule.ScheduledTime.ToString("HH:mm"),
            schedule.RecipientEmail,
            schedule.Timezone,
            schedule.ReportType,
            schedule.CreatedAtUtc,
            schedule.UpdatedAtUtc,
            schedule.DataVersion);
    }
}
