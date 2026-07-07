using System.Security.Cryptography;
using System.Text;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportJobService : IWeeklyReportJobService
{
    private static readonly IReadOnlyList<string> WeekLabels = new[] { "W1" };

    private readonly IWeeklyReportJobRepository _repository;
    private readonly IWeeklyReportQueue _queue;
    private readonly ITrainingRepository _trainingRepository;
    private readonly IPreCheckRepository _preCheckRepository;
    private readonly IWeeklyReportPdfGenerator _pdfGenerator;
    private readonly IWeeklyReportBlobStorage _blobStorage;
    private readonly IEmailSender _emailSender;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WeeklyReportJobService> _logger;

    public WeeklyReportJobService(
        IWeeklyReportJobRepository repository,
        IWeeklyReportQueue queue,
        ITrainingRepository trainingRepository,
        IPreCheckRepository preCheckRepository,
        IWeeklyReportPdfGenerator pdfGenerator,
        IWeeklyReportBlobStorage blobStorage,
        IEmailSender emailSender,
        TimeProvider timeProvider,
        ILogger<WeeklyReportJobService> logger)
    {
        _repository = repository;
        _queue = queue;
        _trainingRepository = trainingRepository;
        _preCheckRepository = preCheckRepository;
        _pdfGenerator = pdfGenerator;
        _blobStorage = blobStorage;
        _emailSender = emailSender;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<WeeklyReportJobDto> RequestScheduledWeeklyReportAsync(
        int userId,
        string scheduleId,
        DateTimeOffset scheduledForUtc,
        string recipientEmail,
        string timeZoneId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var runKey = CreateRunKey(scheduleId, scheduledForUtc);
        var existing = await _repository.GetLatestByUserIdAndRunKeyAsync(
            userId,
            scheduleId,
            runKey,
            cancellationToken);

        if (existing is not null && existing.Status != WeeklyReportJobStatuses.Failed)
        {
            _logger.LogInformation(
                "Existing weekly report job reused. UserId={UserId}, ScheduleId={ScheduleId}, RunKey={RunKey}, JobId={JobId}.",
                userId,
                scheduleId,
                runKey,
                existing.Id);
            return ToDto(existing);
        }

        var now = _timeProvider.GetUtcNow();
        var (weekStartDate, weekEndDate) = GetReportWeek(scheduledForUtc, timeZoneId);
        var job = new WeeklyReportJob(
            CreateDeterministicJobId(runKey),
            userId,
            scheduleId,
            runKey,
            WeeklyReportConstants.ReportType,
            weekStartDate,
            weekEndDate,
            scheduledForUtc,
            timeZoneId,
            recipientEmail,
            WeeklyReportConstants.DataVersion,
            WeeklyReportJobStatuses.Queued,
            $"weekly-report:{userId}:{runKey}:{Guid.NewGuid():N}",
            now,
            now,
            now,
            null,
            null,
            null,
            null,
            null,
            null,
            null);

        job = await _repository.CreateAsync(job, cancellationToken);

        if (job.CreatedAtUtc != now)
        {
            _logger.LogInformation(
                "Existing weekly report job reused after create conflict. UserId={UserId}, ScheduleId={ScheduleId}, RunKey={RunKey}, JobId={JobId}.",
                userId,
                scheduleId,
                runKey,
                job.Id);
            return ToDto(job);
        }

        await _queue.EnqueueAsync(ToQueueMessage(job));

        _logger.LogInformation(
            "Weekly report queue message sent. UserId={UserId}, ScheduleId={ScheduleId}, RunKey={RunKey}, JobId={JobId}, ScheduledForUtc={ScheduledForUtc}.",
            userId,
            scheduleId,
            runKey,
            job.Id,
            scheduledForUtc);

        return ToDto(job);
    }

    public async Task ProcessAsync(
        WeeklyReportQueueMessageDto queueMessage,
        CancellationToken cancellationToken = default)
    {
        ValidateQueueMessage(queueMessage);

        var job = await _repository.GetByIdAsync(
            queueMessage.UserId,
            queueMessage.JobId,
            cancellationToken);

        if (job is null
            || !string.Equals(job.ScheduleId, queueMessage.ScheduleId, StringComparison.Ordinal)
            || !string.Equals(job.RunKey, queueMessage.RunKey, StringComparison.Ordinal)
            || job.ScheduledForUtc != queueMessage.ScheduledForUtc)
        {
            return;
        }

        if (!await _repository.TryStartProcessingAsync(
            queueMessage.UserId,
            queueMessage.JobId,
            queueMessage.RunKey,
            cancellationToken))
        {
            return;
        }

        _logger.LogInformation(
            "Weekly report worker started. UserId={UserId}, ScheduleId={ScheduleId}, RunKey={RunKey}, JobId={JobId}, ScheduledForUtc={ScheduledForUtc}.",
            job.UserId,
            job.ScheduleId,
            job.RunKey,
            job.Id,
            job.ScheduledForUtc);

        try
        {
            var result = await GenerateWeeklyResultAsync(job, cancellationToken);
            var pdfBytes = _pdfGenerator.GeneratePdf(result, job.DataVersion, job.CorrelationId);
            var blobName = await _blobStorage.UploadAsync(
                job.UserId,
                job.WeekStartDate.ToString("yyyy-MM-dd"),
                job.WeekEndDate.ToString("yyyy-MM-dd"),
                job.DataVersion,
                job.CorrelationId,
                pdfBytes,
                cancellationToken);

            await _emailSender.SendAsync(
                job.RecipientEmail,
                $"LiftOps weekly trend report {job.WeekStartDate:yyyy-MM-dd} - {job.WeekEndDate:yyyy-MM-dd}",
                "Hello, your LiftOps weekly trend report is attached.",
                new EmailAttachment(
                    $"weekly-trends-report-{job.WeekStartDate:yyyy-MM-dd}.pdf",
                    "application/pdf",
                    pdfBytes),
                cancellationToken);

            await _repository.TryCompleteIfCurrentProcessingAsync(
                job.UserId,
                job.Id,
                job.RunKey,
                result,
                blobName,
                cancellationToken);

            _logger.LogInformation(
                "Weekly report worker completed. UserId={UserId}, ScheduleId={ScheduleId}, RunKey={RunKey}, JobId={JobId}.",
                job.UserId,
                job.ScheduleId,
                job.RunKey,
                job.Id);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            await _repository.TryMarkFailedIfCurrentProcessingAsync(
                job.UserId,
                job.Id,
                job.RunKey,
                exception.Message,
                cancellationToken);

            _logger.LogError(
                exception,
                "Weekly report worker failed. UserId={UserId}, ScheduleId={ScheduleId}, RunKey={RunKey}, JobId={JobId}.",
                job.UserId,
                job.ScheduleId,
                job.RunKey,
                job.Id);
            throw;
        }
    }

    private async Task<TrendReportResultDto> GenerateWeeklyResultAsync(
        WeeklyReportJob job,
        CancellationToken cancellationToken)
    {
        var trainingDays = await _trainingRepository.GetByDateRangeAsync(
            job.UserId,
            job.WeekStartDate,
            job.WeekEndDate,
            cancellationToken);
        var preChecks = await _preCheckRepository.GetByDateRangeAsync(
            job.UserId,
            job.WeekStartDate,
            job.WeekEndDate,
            cancellationToken);

        var sessions = trainingDays.SelectMany(day => day.Sessions).ToList();
        var workingSets = sessions
            .SelectMany(session => session.Exercises)
            .SelectMany(exercise => exercise.Sets)
            .Where(set => !set.IsWarmup)
            .ToList();
        var readiness = preChecks.Count == 0
            ? 0
            : preChecks.Average(GetReadinessScore);
        var sleep = preChecks.Count == 0
            ? 0
            : preChecks.Average(log => log.SleepHours);
        var sessionLoad = sessions.Sum(session => session.DurationMinutes * session.SessionRpe);
        var volume = workingSets.Sum(set => set.Reps * set.WeightKg);

        return new TrendReportResultDto(
            job.WeekStartDate.ToString("yyyy-MM-dd"),
            job.WeekStartDate.ToString("yyyy-MM-dd"),
            null,
            null,
            WeekLabels,
            new[]
            {
                CreateSummaryCard("readiness", "Readiness", Math.Round(readiness, 1), "/100"),
                CreateSummaryCard("sleep", "Sleep", Math.Round(sleep, 1), "h"),
                CreateSummaryCard("sessionLoad", "Training Load", Math.Round(sessionLoad, 1), string.Empty),
                CreateSummaryCard("volume", "Training Volume", Math.Round(volume, 1), "kg"),
            },
            null);
    }

    private static TrendReportSummaryCardDto CreateSummaryCard(
        string type,
        string title,
        decimal value,
        string unit)
    {
        return new TrendReportSummaryCardDto(
            type,
            title,
            value,
            null,
            null,
            unit,
            "mint",
            new[] { value });
    }

    private static decimal GetReadinessScore(PreCheckModel log)
    {
        var recoverySoreness = 6 - log.Soreness;
        var recoveryStress = 6 - log.Stress;
        var total = log.SleepQuality
            + recoverySoreness
            + recoveryStress
            + log.Motivation
            + log.Energy;
        return Math.Round((total / 25m) * 100m, 0);
    }

    private static (DateOnly WeekStartDate, DateOnly WeekEndDate) GetReportWeek(
        DateTimeOffset scheduledForUtc,
        string timeZoneId)
    {
        var timezone = GetTimeZone(timeZoneId);
        var localScheduled = TimeZoneInfo.ConvertTime(scheduledForUtc, timezone);
        var weekEnd = DateOnly.FromDateTime(localScheduled.Date).AddDays(-1);
        return (weekEnd.AddDays(-6), weekEnd);
    }

    private static TimeZoneInfo GetTimeZone(string timeZoneId)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
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
            job.Id,
            job.UserId,
            job.ScheduleId,
            job.RunKey,
            job.ScheduledForUtc);
    }

    private static WeeklyReportJobDto ToDto(WeeklyReportJob job)
    {
        return new WeeklyReportJobDto(
            job.Id,
            job.UserId,
            job.ScheduleId,
            job.RunKey,
            job.ReportType,
            job.WeekStartDate.ToString("yyyy-MM-dd"),
            job.WeekEndDate.ToString("yyyy-MM-dd"),
            job.ScheduledForUtc,
            job.Status,
            job.ErrorMessage,
            job.RequestedAtUtc,
            job.CreatedAtUtc,
            job.UpdatedAtUtc,
            job.StartedAtUtc,
            job.CompletedAtUtc);
    }

    private static string CreateRunKey(string scheduleId, DateTimeOffset scheduledForUtc)
    {
        return $"{scheduleId}:{scheduledForUtc:O}";
    }

    private static int CreateDeterministicJobId(string runKey)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(runKey));
        return BitConverter.ToInt32(hash, 0) & int.MaxValue;
    }

    private static void ValidateQueueMessage(WeeklyReportQueueMessageDto queueMessage)
    {
        if (queueMessage.JobId <= 0
            || queueMessage.UserId <= 0
            || string.IsNullOrWhiteSpace(queueMessage.ScheduleId)
            || string.IsNullOrWhiteSpace(queueMessage.RunKey))
        {
            throw new ArgumentException("Weekly report queue message is invalid.");
        }
    }
}
