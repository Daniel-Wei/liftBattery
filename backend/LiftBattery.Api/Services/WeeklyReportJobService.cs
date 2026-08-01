using LiftBattery.Api.DTOs;
using LiftBattery.Api.Entities;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportJobService : IWeeklyReportJobService
{
    private static readonly IReadOnlyList<string> WeekLabels = new[] { "W1" };
    private static readonly TimeSpan DefaultProcessingLease = TimeSpan.FromMinutes(30);

    private readonly IWeeklyReportScheduleRepository _scheduleRepository;
    private readonly IWeeklyReportDeliveryRepository _deliveryRepository;
    private readonly ITrendReportSourceDataRepository _sourceDataRepository;
    private readonly IWeeklyReportPdfGenerator _pdfGenerator;
    private readonly IWeeklyReportBlobStorage _blobStorage;
    private readonly IEmailSender _emailSender;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WeeklyReportJobService> _logger;
    private readonly TimeSpan _processingLease;

    public WeeklyReportJobService(
        IWeeklyReportScheduleRepository scheduleRepository,
        IWeeklyReportDeliveryRepository deliveryRepository,
        ITrendReportSourceDataRepository sourceDataRepository,
        IWeeklyReportPdfGenerator pdfGenerator,
        IWeeklyReportBlobStorage blobStorage,
        IEmailSender emailSender,
        TimeProvider timeProvider,
        IConfiguration configuration,
        ILogger<WeeklyReportJobService> logger)
    {
        _scheduleRepository = scheduleRepository;
        _deliveryRepository = deliveryRepository;
        _sourceDataRepository = sourceDataRepository;
        _pdfGenerator = pdfGenerator;
        _blobStorage = blobStorage;
        _emailSender = emailSender;
        _timeProvider = timeProvider;
        _logger = logger;
        _processingLease = TimeSpan.FromMinutes(Math.Max(
            1,
            configuration.GetValue(
                "WeeklyReportProcessingLeaseMinutes",
                (int)DefaultProcessingLease.TotalMinutes)));
    }

    public async Task ProcessAsync(
        WeeklyReportQueueMessageDto queueMessage,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(queueMessage.ScheduleId)
            || !WeeklyReportPeriod.TryParse(queueMessage.PeriodKey, out var period)
            || period is null)
        {
            throw new ArgumentException("Weekly report queue message is invalid.");
        }

        // Service Bus contains no user, recipient, scheduling, or source-data state.
        // Always reload the current SQL schedule when execution starts.
        var schedule = await _scheduleRepository.GetByIdAsync(
            queueMessage.ScheduleId,
            cancellationToken);
        if (schedule is null || !schedule.Enabled)
        {
            return;
        }

        var now = _timeProvider.GetUtcNow();
        var processingClaimId = Guid.NewGuid().ToString("N");
        var delivery = await _deliveryRepository.TryClaimAsync(
            schedule.ScheduleId,
            period,
            processingClaimId,
            now,
            now.Add(_processingLease),
            cancellationToken);

        if (delivery is null)
        {
            // Another delivery of the same message owns this period. Its retry (or a
            // later dispatcher pass after lease expiry) is responsible for recovery.
            return;
        }

        if (delivery.Status == WeeklyReportDeliveryStatuses.Sent)
        {
            // At-least-once duplicate after successful commit: no PDF or email work.
            return;
        }

        try
        {
            var (blobPath, pdfBytes) = await GetOrCreateImmutablePdfAsync(
                schedule,
                period,
                delivery,
                processingClaimId,
                cancellationToken);

            // Recipient and Enabled may change while PDF generation is running. The
            // PDF remains the sampled artifact, while delivery uses latest settings.
            var latestSchedule = await _scheduleRepository.GetByIdAsync(
                schedule.ScheduleId,
                cancellationToken);
            if (latestSchedule is null || !latestSchedule.Enabled)
            {
                await _deliveryRepository.ReleaseClaimAsync(
                    schedule.ScheduleId,
                    period.Key,
                    processingClaimId,
                    errorMessage: null,
                    cancellationToken);
                return;
            }

            var idempotencyKey = $"{schedule.ScheduleId}:{period.Key}";
            await _emailSender.SendAsync(
                latestSchedule.RecipientEmail,
                $"LiftOps weekly trend report {period.Start:yyyy-MM-dd} - {period.End:yyyy-MM-dd}",
                "Hello, your LiftOps weekly trend report is attached.",
                idempotencyKey,
                new EmailAttachment(
                    $"weekly-trends-report-{period.Start:yyyy-MM-dd}.pdf",
                    "application/pdf",
                    pdfBytes),
                cancellationToken);

            var sentAtUtc = _timeProvider.GetUtcNow();
            var nextRunAtUtc = WeeklyReportScheduleService.CalculateNextRunUtc(
                latestSchedule.DayOfWeek,
                latestSchedule.LocalSendTime,
                latestSchedule.TimeZoneId,
                sentAtUtc);

            // This transaction is the success boundary: Delivery becomes Sent and the
            // same claimed schedule advances to its next occurrence together.
            if (!await _deliveryRepository.CompleteSentAsync(
                schedule.ScheduleId,
                period.Key,
                processingClaimId,
                latestSchedule.RecipientEmail,
                sentAtUtc,
                nextRunAtUtc,
                cancellationToken))
            {
                throw new InvalidOperationException(
                    "Weekly report delivery could not be committed after sending.");
            }

            _logger.LogInformation(
                "Weekly report sent. ScheduleId={ScheduleId}, PeriodKey={PeriodKey}, BlobPath={BlobPath}.",
                schedule.ScheduleId,
                period.Key,
                blobPath);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            try
            {
                // Pending remains Pending and BlobReady remains BlobReady. Therefore a
                // PDF failure regenerates on redelivery, while an email failure reuses
                // the already persisted BlobPath and exact PDF bytes.
                await _deliveryRepository.ReleaseClaimAsync(
                    schedule.ScheduleId,
                    period.Key,
                    processingClaimId,
                    exception.Message,
                    cancellationToken);
            }
            catch (Exception releaseException) when (releaseException is not OperationCanceledException)
            {
                _logger.LogError(
                    releaseException,
                    "Failed to release weekly report processing claim. ScheduleId={ScheduleId}, PeriodKey={PeriodKey}.",
                    schedule.ScheduleId,
                    period.Key);
            }

            _logger.LogError(
                exception,
                "Weekly report processing failed; Service Bus may redeliver. ScheduleId={ScheduleId}, PeriodKey={PeriodKey}.",
                schedule.ScheduleId,
                period.Key);
            throw;
        }
    }

    private async Task<(string BlobPath, byte[] PdfBytes)> GetOrCreateImmutablePdfAsync(
        WeeklyReportSchedule schedule,
        WeeklyReportPeriod period,
        WeeklyReportDelivery delivery,
        string processingClaimId,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(delivery.BlobPath))
        {
            return (
                delivery.BlobPath,
                await _blobStorage.DownloadAsync(delivery.BlobPath, cancellationToken));
        }

        // Covers a process crash after Blob upload but before BlobPath was written.
        // The deterministic path makes the uploaded artifact discoverable and reusable.
        var existingBlob = await _blobStorage.GetIfExistsAsync(
            schedule.ScheduleId,
            period.Key,
            cancellationToken);
        if (existingBlob is not null)
        {
            if (!await _deliveryRepository.MarkBlobReadyAsync(
                schedule.ScheduleId,
                period.Key,
                processingClaimId,
                existingBlob.BlobPath,
                cancellationToken))
            {
                throw LostProcessingClaim();
            }

            return (existingBlob.BlobPath, existingBlob.Content);
        }

        // DataVersion and all report source rows are captured in the same SQL snapshot
        // transaction. The version is audit metadata only; it does not invalidate this
        // scheduled report if the user edits data after sampling.
        var capture = await _sourceDataRepository.CaptureSnapshotAsync(
            schedule.UserId,
            period.Start,
            period.End,
            cancellationToken);
        var dataSampledAtUtc = _timeProvider.GetUtcNow();
        var generatedAtUtc = _timeProvider.GetUtcNow();
        var metadata = new WeeklyReportPdfMetadata(
            period,
            capture.DataVersion,
            dataSampledAtUtc,
            generatedAtUtc);

        // Persist metadata before Blob upload. If the process dies immediately after
        // upload, the next attempt can recover the deterministic Blob with its audit row.
        if (!await _deliveryRepository.RecordGenerationMetadataAsync(
            schedule.ScheduleId,
            period.Key,
            processingClaimId,
            capture.DataVersion,
            dataSampledAtUtc,
            generatedAtUtc,
            cancellationToken))
        {
            throw LostProcessingClaim();
        }

        var result = GenerateWeeklyResult(capture.Snapshot, period);
        var pdfBytes = _pdfGenerator.GeneratePdf(result, metadata);
        var blobPath = await _blobStorage.UploadAsync(
            schedule.ScheduleId,
            period.Key,
            metadata,
            pdfBytes,
            cancellationToken);

        // Email always uses bytes read back from Blob. This guarantees the attachment
        // is exactly the immutable artifact referenced by WeeklyReportDelivery, even
        // when an earlier attempt won the deterministic-path upload race.
        pdfBytes = await _blobStorage.DownloadAsync(blobPath, cancellationToken);

        if (!await _deliveryRepository.MarkBlobReadyAsync(
            schedule.ScheduleId,
            period.Key,
            processingClaimId,
            blobPath,
            cancellationToken))
        {
            throw LostProcessingClaim();
        }

        return (blobPath, pdfBytes);
    }

    private static TrendReportResultDto GenerateWeeklyResult(
        TrendReportReqSnapshot snapshot,
        WeeklyReportPeriod period)
    {
        var sessions = snapshot.TrainingDays.SelectMany(day => day.Sessions).ToList();
        var workingSets = sessions
            .SelectMany(session => session.Exercises)
            .SelectMany(exercise => exercise.Sets)
            .Where(set => !set.IsWarmup)
            .ToList();
        var readiness = snapshot.PreCheckLogs.Count == 0
            ? 0
            : snapshot.PreCheckLogs.Average(GetReadinessScore);
        var sleep = snapshot.PreCheckLogs.Count == 0
            ? 0
            : snapshot.PreCheckLogs.Average(log => log.SleepHours);
        var sessionLoad = sessions.Sum(session => session.DurationMinutes * session.SessionRpe);
        var volume = workingSets.Sum(set => set.Reps * set.WeightKg);

        return new TrendReportResultDto(
            period.Start.ToString("yyyy-MM-dd"),
            period.End.ToString("yyyy-MM-dd"),
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
        var total = log.SleepQuality
            + (6 - log.Soreness)
            + (6 - log.Stress)
            + log.Motivation
            + log.Energy;
        return Math.Round((total / 25m) * 100m, 0);
    }

    private static InvalidOperationException LostProcessingClaim() =>
        new("Weekly report processing claim was lost.");
}
