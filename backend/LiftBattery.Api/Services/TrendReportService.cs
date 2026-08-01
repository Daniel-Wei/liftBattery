using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Services;

public sealed class TrendReportService : ITrendReportService
{
    private const int CancelMaxAttempts = 5;

    private static readonly HashSet<string> SupportedMuscleGroups = new(StringComparer.Ordinal)
    {
        "Chest",
        "Back",
        "Shoulders",
        "Biceps",
        "Triceps",
        "Quads",
        "Hamstrings",
        "Glutes",
        "Calves",
        "Abs",
    };

    private readonly ITrendReportJobRepository _trendReportJobRepo;
    private readonly ITrendReportSourceDataRepository _sourceDataRepository;
    private readonly ITrendReportJobQueue _trendReportJobQueue;
    private readonly int _demoDelayMilliseconds;
    private readonly int _enqueueRecoveryMaxAttempts;

    public TrendReportService(
        ITrendReportJobRepository trendReportJobRepo,
        ITrendReportSourceDataRepository sourceDataRepository,
        ITrendReportJobQueue trendReportJobQueue,
        IConfiguration configuration)
    {
        _trendReportJobRepo = trendReportJobRepo;
        _sourceDataRepository = sourceDataRepository;
        _trendReportJobQueue = trendReportJobQueue;
        _demoDelayMilliseconds = int.TryParse(
            configuration["TrendReportDemoDelayMilliseconds"],
            out var configuredDelay)
                ? Math.Clamp(configuredDelay, 0, 10_000)
                : 0;
        _enqueueRecoveryMaxAttempts = int.TryParse(
            configuration["TrendReportEnqueueRecoveryMaxAttempts"],
            out var configuredMaxAttempts)
                ? Math.Clamp(configuredMaxAttempts, 1, 100)
                : 5;
    }

    // Synchronous submission path:
    // 1. validate the request and read the current authoritative SQL DataVersion
    // 2. persist the initial EnqueuePending job in Azure Table Storage
    // 3. enqueue a compact trigger; the worker captures source data when execution starts
    public async Task<TrendReportJobDto> SubmitAsync(
        int userId,
        CreateTrendReportRequestDto createTrendReportReqDTO,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ValidateUserId(userId);
        // Validate and normalize the request DTO.
        var validatedTrendReportReq = ValidateRequest(createTrendReportReqDTO);

        // DataVersion is part of the durable Job identity and dedup key. Source rows
        // are deliberately not loaded or copied into the Job during submission.
        var trendReportReqDataVersion = RequireCurrentDataVersion(
            await _sourceDataRepository.GetCurrentDataVersionAsync(
                userId,
                cancellationToken));

        var runId = CreateRunId();
        var newJobCandidate = new NewTrendReportJob(
            userId,
            "正在提交后台队列",
            validatedTrendReportReq,
            runId,
            trendReportReqDataVersion);

        var createResult = await _trendReportJobRepo.CreateOrGetAsync(
            newJobCandidate,
            cancellationToken);
        var job = createResult.Job;

        // If the job was not newly created, an equivalent job already exists.
        // In that case, we return the existing job without enqueuing it again.
        if (!createResult.WasCreated)
        {
            return ToDto(job);
        }

        try
        {
            // Publish a compact JSON command. The consumer still loads the durable job from Azure Table Storage,
            // but the message carries enough metadata for duplicate detection, correlation, retry, and DLQ debugging.
            var publishedJob = await PublishNewJobAsync(job, cancellationToken);
            return ToDto(publishedJob);
        }
        catch (Exception)
        {
            await _trendReportJobRepo.TryRecordInitialEnqueueFailureAsync(
                job.UserId,
                job.Id,
                job.RunId,
                job.DataVersion,
                cancellationToken);
            throw;
        }
    }

    public async Task ProcessAsync(
        TrendReportQueueMessageDto queueMessageDTO,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        // Service Bus delivery is at-least-once. Duplicate deliveries may recapture
        // the same SQL generation, but only one ETag-protected terminal update can win.
        try
        {
            var job = await GetActiveJobForMessageAsync(queueMessageDTO, cancellationToken);

            if (job is null)
            {
                return;
            }

            // Version check 1 and both source-data reads share one SQL snapshot
            // transaction. The returned in-memory snapshot therefore cannot mix data
            // from different CRUD commits or label old rows with a newer version.
            var snapshot = await CaptureCurrentSnapshotAsync(job, cancellationToken);
            if (snapshot is null)
            {
                return;
            }

            // Processing is a display state, not an exclusive worker lease. 
            // Losing this best-effort transition is harmless: 
            // another delivery may have started it, and final persistence still checks JobId, RunId, DataVersion, status, and ETag.
            await _trendReportJobRepo.TryStartProcessingAsync(
                job.UserId,
                job.Id,
                job.RunId,
                job.DataVersion,
                cancellationToken);

            await DelayForDemoAsync(cancellationToken);

            // TryStartProcessingAsync may lose either to another delivery or to a
            // terminal writer. Reloading Table state distinguishes the harmless first
            // case from cancellation/supersession without another SQL version read.
            if (await GetActiveJobForMessageAsync(queueMessageDTO, cancellationToken) is null)
            {
                return;
            }

            var result = GenerateResult(job.Request, snapshot);

            await DelayForDemoAsync(cancellationToken);

            var jobBeforeCompletion = await GetActiveJobForMessageAsync(
                queueMessageDTO,
                cancellationToken);
            if (jobBeforeCompletion is null
                || !await HasCurrentDataVersionAsync(jobBeforeCompletion, cancellationToken))
            {
                return;
            }

            await _trendReportJobRepo.TryCompleteIfCurrentActiveAsync(
                jobBeforeCompletion.UserId,
                jobBeforeCompletion.Id,
                jobBeforeCompletion.RunId,
                jobBeforeCompletion.DataVersion,
                result,
                cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            // Leave the valid message unsettled so Service Bus owns redelivery and DLQ.
            throw;
        }
    }

    public async Task<TrendReportJobDto?> GetByIdAsync(int userId, Guid id)
    {
        ValidateUserId(userId);
        var job = await _trendReportJobRepo.GetByIdAsync(userId, id);
        return job is null || job.UserId != userId ? null : ToDto(job);
    }

    public async Task<TrendReportJobDto?> CancelAsync(
        int userId,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        for (var attempt = 1; attempt <= CancelMaxAttempts; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var job = await _trendReportJobRepo.GetByIdAsync(
                userId,
                id,
                cancellationToken);

            if (job is null || job.UserId != userId)
            {
                return null;
            }

            if (!IsActiveJobStatus(job.Status))
            {
                return ToDto(job);
            }

            if (await _trendReportJobRepo.TryMarkCancelledIfActiveAsync(
                    userId,
                    job.Id,
                    job.RunId,
                    job.DataVersion,
                    cancellationToken))
            {
                var cancelledJob = await _trendReportJobRepo.GetByIdAsync(
                    userId,
                    id,
                    cancellationToken);
                return cancelledJob is null ? null : ToDto(cancelledJob);
            }

            // A worker may have changed the ETag between the read and the conditional
            // cancellation. Reload before deciding whether another attempt is needed.
        }

        throw new InvalidOperationException(
            $"Trend report job {id} could not be cancelled because it kept changing.");
    }

    public async Task<TrendReportResultDto> GenerateResultAsync(int userId, CreateTrendReportRequestDto request)
    {
        ValidateUserId(userId);
        var validatedTrendReportReq = ValidateRequest(request);
        var snapshot = await LoadSnapshotAsync(userId, validatedTrendReportReq);
        return GenerateResult(validatedTrendReportReq, snapshot);
    }

    public async Task<int> RecoverUnstartedEnqueuesAsync(
        DateTimeOffset olderThanUtc,
        int maxCount,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var pendingJobs = await _trendReportJobRepo.GetUnstartedJobsForEnqueueRecoveryAsync(
            olderThanUtc,
            Math.Max(1, maxCount),
            cancellationToken);
        var recoveredCount = 0;

        foreach (var job in pendingJobs)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (await TryRecoverPendingEnqueueAsync(job, cancellationToken))
            {
                recoveredCount++;
            }
        }

        return recoveredCount;
    }

    public async Task<int> ConvergeTimedOutJobsAsync(
        DateTimeOffset queuedBeforeUtc,
        DateTimeOffset processingBeforeUtc,
        int maxCount,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var candidates = await _trendReportJobRepo.GetTimedOutActiveJobsAsync(
            queuedBeforeUtc,
            processingBeforeUtc,
            Math.Max(1, maxCount),
            cancellationToken);
        var convergedCount = 0;

        foreach (var candidate in candidates)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (await _trendReportJobRepo.TryMarkTimedOutIfStillActiveAsync(
                    candidate.UserId,
                    candidate.Id,
                    candidate.RunId,
                    candidate.DataVersion,
                    queuedBeforeUtc,
                    processingBeforeUtc,
                    cancellationToken))
            {
                convergedCount++;
            }
        }

        return convergedCount;
    }

    #region: Private Helper Methods

    private static TrendReportQueueMessageDto CreateQueueMessageDTO(TrendReportJob job)
    {
        return new TrendReportQueueMessageDto(
            job.Id,
            job.RunId,
            job.UserId);
    }

    private async Task<TrendReportJob> PublishNewJobAsync(
        TrendReportJob job,
        CancellationToken cancellationToken)
    {
        // The create transaction already persisted this new job as EnqueuePending
        // together with its dedup row and active lease. Rechecking those rows here
        // would not make the Table-to-Service-Bus handoff atomic: cancellation or
        // invalidation could still happen immediately after any check. Send the
        // at-least-once command and let the worker authoritatively reject stale jobs.
        await EnqueueAndMarkQueuedAsync(job, cancellationToken);

        return await _trendReportJobRepo.GetByIdAsync(
                   job.UserId,
                   job.Id,
                   cancellationToken)
               ?? throw new InvalidOperationException(
                   $"Trend report job {job.Id} was not found after enqueue.");
    }

    private async Task<bool> TryRecoverPendingEnqueueAsync(
        TrendReportJob candidate,
        CancellationToken cancellationToken)
    {
        // The recovery scan is only a snapshot. Atomically increment the retry
        // attempt while the exact RunId/DataVersion is still EnqueuePending. A null
        // result means another request or recovery already changed the job.
        var claimedJob = await _trendReportJobRepo.TryBeginEnqueueRecoveryAttemptAsync(
            candidate.UserId,
            candidate.Id,
            candidate.RunId,
            candidate.DataVersion,
            _enqueueRecoveryMaxAttempts,
            cancellationToken);

        if (claimedJob is null)
        {
            return false;
        }

        try
        {
            await EnqueueAndMarkQueuedAsync(claimedJob, cancellationToken);
            return true;
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            await _trendReportJobRepo.TryRecordEnqueueRecoveryFailureAsync(
                claimedJob.UserId,
                claimedJob.Id,
                claimedJob.RunId,
                claimedJob.DataVersion,
                exception.Message,
                _enqueueRecoveryMaxAttempts,
                cancellationToken);

            throw;
        }
    }

    private async Task EnqueueAndMarkQueuedAsync(
        TrendReportJob job,
        CancellationToken cancellationToken)
    {
        await _trendReportJobQueue.EnqueueAsync(
            CreateQueueMessageDTO(job),
            cancellationToken);

        // Sending and Table Storage cannot share one transaction. If the process
        // stops after the send but before this conditional update, recovery may send
        // the same RunId again; the worker is intentionally idempotent for that case.
        await _trendReportJobRepo.TryMarkQueuedIfEnqueuePendingAsync(
            job.UserId,
            job.Id,
            job.RunId,
            job.DataVersion,
            cancellationToken);
    }

    private static string CreateRunId()
    {
        return $"trend-report:{Guid.NewGuid():N}";
    }
    private async Task<TrendReportJob?> GetActiveJobForMessageAsync(
        TrendReportQueueMessageDto message,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        // Service Bus carries only a lightweight trigger. The durable Job row owns the
        // request and captured DataVersion; RunId rejects a delivery for another run.
        var latestJob = await _trendReportJobRepo.GetByIdAsync(
            message.UserId,
            message.JobId,
            cancellationToken);

        if (latestJob is null
            || latestJob.RunId != message.RunId)
        {
            // The Job was removed or this message belongs to another persisted run.
            // Completing this stale delivery is safe because it cannot produce a result
            // for the current Job identity.
            return null;
        }

        if (latestJob.Status is TrendReportJobStatuses.Completed
            or TrendReportJobStatuses.Failed
            or TrendReportJobStatuses.Cancelled
            or TrendReportJobStatuses.Superseded)
        {
            // Terminal transitions are immutable. Duplicate deliveries become no-ops.
            return null;
        }

        if (latestJob.Status is not (TrendReportJobStatuses.EnqueuePending
            or TrendReportJobStatuses.Queued
            or TrendReportJobStatuses.Processing))
        {
            throw new InvalidOperationException(
                $"Trend report job {latestJob.Id} has unsupported processing status '{latestJob.Status}'.");
        }

        return latestJob;
    }

    private async Task<TrendReportReqSnapshot?> CaptureCurrentSnapshotAsync(
        TrendReportJob job,
        CancellationToken cancellationToken)
    {
        var (snapshotStart, rangeEnd) = GetSnapshotRange(job.Request);
        var sourceDataCapture = await _sourceDataRepository.CaptureSnapshotAsync(
            job.UserId,
            snapshotStart,
            rangeEnd,
            cancellationToken);

        if (!string.Equals(
                job.DataVersion,
                sourceDataCapture.DataVersion,
                StringComparison.Ordinal))
        {
            await _trendReportJobRepo.TryMarkSupersededIfCurrentAsync(
                job.UserId,
                job.RunId,
                job.Id,
                job.DataVersion,
                cancellationToken);
            return null;
        }

        if (!SnapshotHasData(sourceDataCapture.Snapshot))
        {
            await _trendReportJobRepo.TryMarkFailedIfCurrentActiveAsync(
                job.UserId,
                job.Id,
                job.RunId,
                job.DataVersion,
                "No training or pre-check data was found for the selected report period.",
                cancellationToken);
            return null;
        }

        return sourceDataCapture.Snapshot;
    }

    private async Task<bool> HasCurrentDataVersionAsync(
        TrendReportJob job,
        CancellationToken cancellationToken)
    {
        var currentUserDataVersion = await _sourceDataRepository.GetCurrentDataVersionAsync(
            job.UserId,
            cancellationToken);

        if (string.Equals(
                job.DataVersion,
                currentUserDataVersion,
                StringComparison.Ordinal))
        {
            return true;
        }

        await _trendReportJobRepo.TryMarkSupersededIfCurrentAsync(
            job.UserId,
            job.RunId,
            job.Id,
            job.DataVersion,
            cancellationToken);
        return false;
    }

    private Task DelayForDemoAsync(CancellationToken cancellationToken)
    {
        return _demoDelayMilliseconds == 0
            ? Task.CompletedTask
            : Task.Delay(_demoDelayMilliseconds, cancellationToken);
    }

    private async Task<TrendReportReqSnapshot> LoadSnapshotAsync(int userId, TrendReportRequest request)
    {
        var (snapshotStart, rangeEnd) = GetSnapshotRange(request);
        var sourceDataCapture = await _sourceDataRepository.CaptureSnapshotAsync(
            userId,
            snapshotStart,
            rangeEnd);
        if (!SnapshotHasData(sourceDataCapture.Snapshot))
        {
            throw new TrendReportNoDataException(
                "No training or pre-check data was found for the selected report period.");
        }

        return sourceDataCapture.Snapshot;
    }

    private static TrendReportRequest ValidateRequest(CreateTrendReportRequestDto createTrendReportReqDTO)
    {
        if (!DateOnly.TryParse(createTrendReportReqDTO.StartWeek, out var startWeek)
            || !DateOnly.TryParse(createTrendReportReqDTO.EndWeek, out var endWeek))
        {
            throw new ArgumentException("Start week and end week must use yyyy-MM-dd format.");
        }

        if (startWeek.DayOfWeek != DayOfWeek.Monday || endWeek.DayOfWeek != DayOfWeek.Monday)
        {
            throw new ArgumentException("Start week and end week must both be Mondays.");
        }

        if (startWeek > endWeek)
        {
            throw new ArgumentException("Start week must not be after end week.");
        }

        var weekCount = ((endWeek.DayNumber - startWeek.DayNumber) / 7) + 1;

        if (weekCount > 52)
        {
            throw new ArgumentException("A report can contain at most 52 weeks.");
        }

        DateOnly? comparisonStartWeek = null;
        DateOnly? comparisonEndWeek = null;

        if (!string.IsNullOrWhiteSpace(createTrendReportReqDTO.ComparisonStartWeek)
            || !string.IsNullOrWhiteSpace(createTrendReportReqDTO.ComparisonEndWeek))
        {
            if (!DateOnly.TryParse(createTrendReportReqDTO.ComparisonStartWeek, out var parsedComparisonStartWeek)
                || !DateOnly.TryParse(createTrendReportReqDTO.ComparisonEndWeek, out var parsedComparisonEndWeek))
            {
                throw new ArgumentException("Comparison start week and end week must use yyyy-MM-dd format.");
            }

            if (parsedComparisonStartWeek.DayOfWeek != DayOfWeek.Monday
                || parsedComparisonEndWeek.DayOfWeek != DayOfWeek.Monday)
            {
                throw new ArgumentException("Comparison start week and end week must both be Mondays.");
            }

            if (parsedComparisonStartWeek > parsedComparisonEndWeek)
            {
                throw new ArgumentException("Comparison start week must not be after comparison end week.");
            }

            var comparisonWeekCount = ((parsedComparisonEndWeek.DayNumber - parsedComparisonStartWeek.DayNumber) / 7) + 1;

            if (comparisonWeekCount != weekCount)
            {
                throw new ArgumentException("Comparison period must contain the same number of weeks as the selected training cycle.");
            }

            comparisonStartWeek = parsedComparisonStartWeek;
            comparisonEndWeek = parsedComparisonEndWeek;
        }

        return new TrendReportRequest(startWeek, endWeek, comparisonStartWeek, comparisonEndWeek);
    }

    private static TrendReportResultDto GenerateResult(
        TrendReportRequest request,
        TrendReportReqSnapshot snapshot)
    {
        var reportPeriods = BuildReportPeriods(request);
        var trainingSessions = ToReportSessions(snapshot.TrainingDays);
        var summaryCards = CreateTrendSummaryCards(request, snapshot, trainingSessions);
        var muscleStimulation = CreateMuscleStimulationReport(
            request.StartWeek,
            request.EndWeek,
            request.ComparisonStartWeek,
            request.ComparisonEndWeek,
            trainingSessions);

        return new TrendReportResultDto(
            request.StartWeek.ToString("yyyy-MM-dd"),
            request.EndWeek.ToString("yyyy-MM-dd"),
            request.ComparisonStartWeek?.ToString("yyyy-MM-dd"),
            request.ComparisonEndWeek?.ToString("yyyy-MM-dd"),
            reportPeriods.Select(period => period.Label).ToList(),
            summaryCards,
            muscleStimulation);
    }

    private static IReadOnlyList<TrendReportSummaryCardDto> CreateTrendSummaryCards(
        TrendReportRequest request,
        TrendReportReqSnapshot snapshot,
        IReadOnlyList<ReportTrainingSession> trainingSessions)
    {
        var currentWeeks = BuildWeeks(request.StartWeek, request.EndWeek);
        var comparisonWeeks = request.ComparisonStartWeek.HasValue && request.ComparisonEndWeek.HasValue
            ? BuildWeeks(request.ComparisonStartWeek.Value, request.ComparisonEndWeek.Value)
            : Array.Empty<ReportWeek>();

        return new[]
        {
            CreatePreCheckSummaryCard(
                "readiness",
                "Readiness",
                "/100",
                "cyan",
                currentWeeks,
                comparisonWeeks,
                snapshot.PreCheckLogs,
                GetReadinessScore),
            CreatePreCheckSummaryCard(
                "sleep",
                "Sleep",
                "h",
                "purple",
                currentWeeks,
                comparisonWeeks,
                snapshot.PreCheckLogs,
                log => log.SleepHours),
            CreateTrainingSummaryCard(
                "sessionLoad",
                "Training Load",
                "",
                "mint",
                currentWeeks,
                comparisonWeeks,
                trainingSessions,
                GetWeeklySessionLoad),
            CreateTrainingSummaryCard(
                "volume",
                "Training Volume",
                "kg",
                "yellow",
                currentWeeks,
                comparisonWeeks,
                trainingSessions,
                GetWeeklyVolume),
        };
    }

    private static TrendReportSummaryCardDto CreatePreCheckSummaryCard(
        string type,
        string title,
        string unit,
        string variant,
        IReadOnlyList<ReportWeek> currentWeeks,
        IReadOnlyList<ReportWeek> comparisonWeeks,
        IReadOnlyList<PreCheckModel> logs,
        Func<PreCheckModel, decimal> getValue)
    {
        var currentValues = GetWeeklyPreCheckAverages(currentWeeks, logs, getValue);
        var comparisonValues = GetWeeklyPreCheckAverages(comparisonWeeks, logs, getValue);
        var currentValue = AverageNonZero(currentValues);
        var comparisonValue = comparisonValues.Count > 0 ? AverageNonZero(comparisonValues) : (decimal?)null;

        return new TrendReportSummaryCardDto(
            type,
            title,
            Math.Round(currentValue, 1),
            comparisonValue.HasValue ? Math.Round(comparisonValue.Value, 1) : null,
            comparisonValue.HasValue ? CalculatePercentChange(currentValue, comparisonValue.Value) : null,
            unit,
            variant,
            currentValues.Select(value => Math.Round(value, 1)).ToList());
    }

    private static TrendReportSummaryCardDto CreateTrainingSummaryCard(
        string type,
        string title,
        string unit,
        string variant,
        IReadOnlyList<ReportWeek> currentWeeks,
        IReadOnlyList<ReportWeek> comparisonWeeks,
        IReadOnlyList<ReportTrainingSession> sessions,
        Func<ReportWeek, IReadOnlyList<ReportTrainingSession>, decimal> getWeekValue)
    {
        var currentValues = currentWeeks.Select(week => getWeekValue(week, sessions)).ToList();
        var comparisonValues = comparisonWeeks.Select(week => getWeekValue(week, sessions)).ToList();
        var currentValue = currentValues.Sum();
        var comparisonValue = comparisonValues.Count > 0 ? comparisonValues.Sum() : (decimal?)null;

        return new TrendReportSummaryCardDto(
            type,
            title,
            Math.Round(currentValue, 1),
            comparisonValue.HasValue ? Math.Round(comparisonValue.Value, 1) : null,
            comparisonValue.HasValue ? CalculatePercentChange(currentValue, comparisonValue.Value) : null,
            unit,
            variant,
            currentValues.Select(value => Math.Round(value, 1)).ToList());
    }

    private static IReadOnlyList<decimal> GetWeeklyPreCheckAverages(
        IReadOnlyList<ReportWeek> weeks,
        IReadOnlyList<PreCheckModel> logs,
        Func<PreCheckModel, decimal> getValue)
    {
        return weeks.Select(week =>
        {
            var weekLogs = logs
                .Where(log => log.Date >= week.StartDate && log.Date <= week.EndDate)
                .ToList();

            return weekLogs.Count == 0 ? 0 : weekLogs.Average(getValue);
        }).ToList();
    }

    private static decimal GetWeeklySessionLoad(
        ReportWeek week,
        IReadOnlyList<ReportTrainingSession> sessions)
    {
        return sessions
            .Where(session => session.Date >= week.StartDate && session.Date <= week.EndDate)
            .Sum(session => session.DurationMinutes * session.SessionRpe);
    }

    private static decimal GetWeeklyVolume(
        ReportWeek week,
        IReadOnlyList<ReportTrainingSession> sessions)
    {
        return sessions
            .Where(session => session.Date >= week.StartDate && session.Date <= week.EndDate)
            .SelectMany(session => session.Sets)
            .Where(set => !set.IsWarmup)
            .Sum(set => set.Reps * set.WeightKg);
    }

    private static decimal AverageNonZero(IReadOnlyList<decimal> values)
    {
        var nonZeroValues = values.Where(value => value > 0).ToList();
        return nonZeroValues.Count == 0 ? 0 : nonZeroValues.Average();
    }

    private static decimal CalculatePercentChange(decimal current, decimal comparison)
    {
        if (comparison == 0)
        {
            return current > 0 ? 100m : 0m;
        }

        return Math.Round(((current - comparison) / comparison) * 100m, 1);
    }

    private static IReadOnlyList<ReportWeek> BuildWeeks(DateOnly startWeek, DateOnly endWeek)
    {
        var weeks = new List<ReportWeek>();
        var currentStart = startWeek;

        while (currentStart <= endWeek)
        {
            weeks.Add(new ReportWeek(
                $"W{weeks.Count + 1}",
                currentStart,
                currentStart.AddDays(6)));
            currentStart = currentStart.AddDays(7);
        }

        return weeks;
    }

    private static IReadOnlyList<ReportWeek> BuildReportPeriods(TrendReportRequest request)
    {
        if (request.ComparisonStartWeek.HasValue && request.ComparisonEndWeek.HasValue)
        {
            return new[]
            {
                new ReportWeek(
                    "对比周期",
                    request.ComparisonStartWeek.Value,
                    request.ComparisonEndWeek.Value.AddDays(6)),
                new ReportWeek(
                    "选定周期",
                    request.StartWeek,
                    request.EndWeek.AddDays(6)),
            };
        }

        return new[]
        {
            new ReportWeek(
                "选定周期",
                request.StartWeek,
                request.EndWeek.AddDays(6)),
        };
    }

    private static IReadOnlyList<ReportTrainingSession> ToReportSessions(
        IReadOnlyList<TrainingDayModel> days)
    {
        return days
            .SelectMany(day => day.Sessions.Select(session => new ReportTrainingSession(
                day.Date,
                session.DurationMinutes,
                session.SessionRpe,
                session.Exercises.SelectMany(exercise => exercise.Sets.Select(set =>
                    new ReportTrainingSet(
                        exercise.MuscleGroup,
                        exercise.ExerciseName,
                        set.Reps,
                        set.WeightKg,
                        set.Rpe,
                        set.Rir,
                        set.IsWarmup))).ToList())))
            .ToList();
    }

    private static MuscleStimulationReportDto CreateMuscleStimulationReport(
        DateOnly startDate,
        DateOnly endWeek,
        DateOnly? comparisonStartWeek,
        DateOnly? comparisonEndWeek,
        IReadOnlyList<ReportTrainingSession> sessions)
    {
        var endDate = endWeek.AddDays(6);
        var currentScores = CalculateMuscleScores(sessions, startDate, endDate);
        var hasComparison = comparisonStartWeek.HasValue && comparisonEndWeek.HasValue;
        var previousScores = new Dictionary<string, decimal>(StringComparer.Ordinal);

        if (comparisonStartWeek is DateOnly comparisonStart
            && comparisonEndWeek is DateOnly comparisonEnd)
        {
            previousScores = CalculateMuscleScores(sessions, comparisonStart, comparisonEnd.AddDays(6));
        }
        var total = currentScores.Values.Sum();

        var muscles = currentScores
            .OrderByDescending(item => item.Value)
            .Select(item =>
            {
                previousScores.TryGetValue(item.Key, out var previousScore);
                var change = hasComparison
                    ? previousScore == 0
                        ? item.Value > 0 ? 100m : 0m
                        : ((item.Value - previousScore) / previousScore) * 100m
                    : 0m;
                var percentage = total == 0 ? 0 : (item.Value / total) * 100m;

                return new MuscleStimulationItemDto(
                    item.Key,
                    Math.Round(item.Value, 0),
                    Math.Round(percentage, 0),
                    Math.Round(change, 0),
                    GetStimulusLevel(percentage));
            })
            .ToList();

        var previousTotal = previousScores.Values.Sum();
        var totalChange = hasComparison
            ? previousTotal == 0
                ? total > 0 ? 100m : 0m
                : ((total - previousTotal) / previousTotal) * 100m
            : 0m;

        return new MuscleStimulationReportDto(
            Math.Round(total, 0),
            Math.Round(totalChange, 1),
            muscles.Count(muscle => muscle.Level == "high"),
            muscles.Count(muscle => muscle.Level == "low"),
            muscles);
    }

    private static Dictionary<string, decimal> CalculateMuscleScores(
        IReadOnlyList<ReportTrainingSession> sessions,
        DateOnly startDate,
        DateOnly endDate)
    {
        var scores = new Dictionary<string, decimal>(StringComparer.Ordinal);

        foreach (var set in sessions
            .Where(session => session.Date >= startDate && session.Date <= endDate)
            .SelectMany(session => session.Sets)
            .Where(set => !set.IsWarmup))
        {
            foreach (var contribution in GetMuscleContributions(set.MuscleGroup, set.ExerciseName))
            {
                var rirFactor = set.Rir.HasValue
                    ? Math.Clamp((5m - set.Rir.Value) / 5m, 0.2m, 1.2m)
                    : 1m;
                var setScore = Math.Max(1, set.Reps)
                    * Math.Max(1m, set.WeightKg)
                    * contribution.Contribution
                    * rirFactor
                    / 10m;

                scores[contribution.Muscle] = scores.GetValueOrDefault(contribution.Muscle) + setScore;
            }
        }

        foreach (var muscle in SupportedMuscleGroups)
        {
            scores.TryAdd(muscle, 0);
        }

        return scores;
    }

    private static IReadOnlyList<MuscleContribution> GetMuscleContributions(
        string muscleGroup,
        string exerciseName)
    {
        var normalizedExercise = exerciseName.ToLowerInvariant();

        if (normalizedExercise.Contains("bench", StringComparison.Ordinal)
            || normalizedExercise.Contains("push-up", StringComparison.Ordinal)
            || normalizedExercise.Contains("dip", StringComparison.Ordinal))
        {
            return new[]
            {
                new MuscleContribution("Chest", 1.0m),
                new MuscleContribution("Triceps", 0.45m),
                new MuscleContribution("Shoulders", 0.35m),
            };
        }

        if (normalizedExercise.Contains("row", StringComparison.Ordinal)
            || normalizedExercise.Contains("pull", StringComparison.Ordinal))
        {
            return new[]
            {
                new MuscleContribution("Back", 1.0m),
                new MuscleContribution("Biceps", 0.45m),
                new MuscleContribution("Shoulders", 0.2m),
            };
        }

        if (normalizedExercise.Contains("squat", StringComparison.Ordinal)
            || normalizedExercise.Contains("leg press", StringComparison.Ordinal)
            || normalizedExercise.Contains("lunge", StringComparison.Ordinal))
        {
            return new[]
            {
                new MuscleContribution("Quads", 1.0m),
                new MuscleContribution("Glutes", 0.55m),
                new MuscleContribution("Hamstrings", 0.25m),
            };
        }

        if (normalizedExercise.Contains("deadlift", StringComparison.Ordinal)
            || normalizedExercise.Contains("leg curl", StringComparison.Ordinal)
            || normalizedExercise.Contains("good morning", StringComparison.Ordinal))
        {
            return new[]
            {
                new MuscleContribution("Hamstrings", 1.0m),
                new MuscleContribution("Glutes", 0.65m),
                new MuscleContribution("Back", 0.35m),
            };
        }

        if (normalizedExercise.Contains("press", StringComparison.Ordinal)
            || normalizedExercise.Contains("raise", StringComparison.Ordinal)
            || normalizedExercise.Contains("delt", StringComparison.Ordinal))
        {
            return new[]
            {
                new MuscleContribution("Shoulders", 1.0m),
                new MuscleContribution("Triceps", 0.35m),
                new MuscleContribution("Chest", 0.2m),
            };
        }

        return new[]
        {
            new MuscleContribution(muscleGroup, 1.0m),
        };
    }

    private static string GetStimulusLevel(decimal percentage)
    {
        if (percentage >= 22) return "high";
        if (percentage >= 10) return "medium";
        if (percentage > 0) return "low";
        return "none";
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

    private static (DateOnly Start, DateOnly End) GetSnapshotRange(TrendReportRequest request)
    {
        var snapshotStart = request.ComparisonStartWeek.HasValue
            ? Min(request.StartWeek, request.ComparisonStartWeek.Value)
            : request.StartWeek;
        var rangeEnd = request.ComparisonEndWeek.HasValue
            ? Max(request.EndWeek, request.ComparisonEndWeek.Value).AddDays(6)
            : request.EndWeek.AddDays(6);

        return (snapshotStart, rangeEnd);
    }

    private static DateOnly Min(DateOnly first, DateOnly second)
    {
        return first <= second ? first : second;
    }

    private static DateOnly Max(DateOnly first, DateOnly second)
    {
        return first >= second ? first : second;
    }

    private static bool SnapshotHasData(TrendReportReqSnapshot snapshot)
    {
        return snapshot.TrainingDays.Count > 0 || snapshot.PreCheckLogs.Count > 0;
    }

    private static string RequireCurrentDataVersion(string? currentDataVersion)
    {
        if (!string.IsNullOrWhiteSpace(currentDataVersion))
        {
            return currentDataVersion;
        }

        throw new TrendReportNoDataException(
            "No training or pre-check data has been stored yet.");
    }

    private static void ValidateUserId(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentException("User id must be positive.");
        }
    }

    private static bool IsActiveJobStatus(string status)
    {
        return status is TrendReportJobStatuses.EnqueuePending
            or TrendReportJobStatuses.Queued
            or TrendReportJobStatuses.Processing;
    }

    private static TrendReportJobDto ToDto(TrendReportJob job)
    {
        return new TrendReportJobDto(
            job.Id,
            job.RunId,
            job.DataVersion,
            job.Status,
            job.ProgressPercent,
            job.CurrentStage,
            job.ErrorMessage,
            job.CreatedAtUtc,
            job.StartedAtUtc,
            job.CompletedAtUtc,
            job.UpdatedAtUtc,
            job.Result);
    }

    #endregion

    #region: Private DTOs for internal processing

    private sealed record ReportWeek(
        string Label,
        DateOnly StartDate,
        DateOnly EndDate);

    private sealed record ReportTrainingSession(
        DateOnly Date,
        int DurationMinutes,
        decimal SessionRpe,
        IReadOnlyList<ReportTrainingSet> Sets);

    private sealed record ReportTrainingSet(
        string MuscleGroup,
        string ExerciseName,
        int Reps,
        decimal WeightKg,
        decimal? Rpe,
        decimal? Rir,
        bool IsWarmup);

    private sealed record MuscleContribution(string Muscle, decimal Contribution);

    #endregion
}
