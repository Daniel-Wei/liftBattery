using System.Runtime.InteropServices.JavaScript;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Services;

public sealed class TrendReportService : ITrendReportService
{
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

    private static readonly JsonSerializerOptions FingerprintJsonOptions = new(JsonSerializerDefaults.Web);
    private readonly ITrendReportJobRepository _trendReportJobRepo;
    private readonly ITrainingRepository _trainingRepo;
    private readonly IPreCheckRepository _preCheckRepo;
    private readonly ITrendReportMessageQueueService _trendReportMessageQueueRepo;
    private readonly int _demoDelayMilliseconds;

    public TrendReportService(
        ITrendReportJobRepository trendReportJobRepo,
        ITrainingRepository trainingRepo,
        IPreCheckRepository preCheckRepo,
        ITrendReportMessageQueueService trendReportMessageQueueRepo,
        IConfiguration configuration)
    {
        _trendReportJobRepo = trendReportJobRepo;
        _trainingRepo = trainingRepo;
        _preCheckRepo = preCheckRepo;
        _trendReportMessageQueueRepo = trendReportMessageQueueRepo;
        _demoDelayMilliseconds = int.TryParse(
            configuration["TrendReportDemoDelayMilliseconds"],
            out var configuredDelay)
                ? Math.Clamp(configuredDelay, 0, 10_000)
                : 0;
    }

    // Synchronous producer path:
    // 1. validate the request and capture a submission-time data snapshot
    // 2. persist the initial Queued job in Azure Table Storage
    // 3. enqueue the job ID for background processing
    public async Task<TrendReportJobDto> CreateAsync(int userId, CreateTrendReportRequestDto createTrendReportReqDTO)
    {
        ValidateUserId(userId);
        // Validate and normalize the request DTO.
        var validatedTrendReportReq = ValidateRequest(createTrendReportReqDTO);

        // Load the database records used for the submission-time snapshot.
        var snapshotStart = validatedTrendReportReq.ComparisonStartWeek.HasValue
            ? Min(validatedTrendReportReq.StartWeek, validatedTrendReportReq.ComparisonStartWeek.Value)
            : validatedTrendReportReq.StartWeek;
        var rangeEnd = validatedTrendReportReq.ComparisonEndWeek.HasValue
            ? Max(validatedTrendReportReq.EndWeek, validatedTrendReportReq.ComparisonEndWeek.Value).AddDays(6)
            : validatedTrendReportReq.EndWeek.AddDays(6);
        var trainingDays = await _trainingRepo.GetByDateRangeAsync(
            userId,
            snapshotStart,
            rangeEnd);
        var preCheckLogs = await _preCheckRepo.GetByDateRangeAsync(
            userId,
            snapshotStart,
            rangeEnd);
        var trendReportReqSnapshot = new TrendReportReqSnapshot(trainingDays, preCheckLogs);

        var trendReportReqDataVersion = await _trendReportJobRepo.GetOrCreateCurrentTrendReportReqDataVersionAsync(userId);
        
        var reportReqFingerprint = CreateTrendReportReqFingerprint(validatedTrendReportReq, trendReportReqSnapshot, trendReportReqDataVersion);
        var existingSameVersionJob = await _trendReportJobRepo.GetLatestByUserIdAndFingerprintAsync(userId, trendReportReqDataVersion, reportReqFingerprint);

        if (existingSameVersionJob is not null
            && existingSameVersionJob.Status is not TrendReportJobStatuses.Failed
                and not TrendReportJobStatuses.Cancelled
                and not TrendReportJobStatuses.Superseded)
        {
            return ToDto(existingSameVersionJob);
        }

        // cancel any other active jobs with different data versions for the same user, 
        // since they are now superseded by this new request
        var activeJobs = await _trendReportJobRepo.GetActiveByUserIdAsync(userId);
        var now = DateTimeOffset.UtcNow;

        foreach (var activeJob in activeJobs)
        {
            await _trendReportJobRepo.UpdateAsync(activeJob with
            {
                Status = TrendReportJobStatuses.Cancelled,
                CurrentStage = "已取消：用户提交了新的报告请求",
                ErrorMessage = null,
                CompletedAtUtc = now,
                UpdatedAtUtc = now,
            });
        }

        var job = new TrendReportJob(
            Random.Shared.Next(1, int.MaxValue),
            userId,
            TrendReportJobStatuses.Queued,
            0,
            "等待后台处理",
            validatedTrendReportReq,
            trendReportReqDataVersion,
            reportReqFingerprint,
            // The request stores the selected report period; the snapshot stores database data at submission time.
            trendReportReqSnapshot,
            null,
            null,
            now,
            null,
            null,
            now);

        // Persist the initial Queued job before publishing its message.
        await _trendReportJobRepo.CreateAsync(job);

        try
        {
            // Publish a compact JSON command. The consumer still loads the durable job from Azure Table Storage,
            // but the message carries enough metadata for duplicate detection, correlation, retry, and DLQ debugging.
            await _trendReportMessageQueueRepo.EnqueueAsync(CreateQueueMessageDTO(job));
        }
        catch (Exception exception)
        {
            var failedJob = job with
            {
                Status = TrendReportJobStatuses.Failed,
                CurrentStage = "报告任务提交失败",
                ErrorMessage = exception.Message,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };
            await _trendReportJobRepo.UpdateAsync(failedJob);
            throw;
        }

        return ToDto(job);
    }

    public async Task ProcessAsync(TrendReportQueueMessageDto queueMessageDTO, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (await StopIfQueueMessageIsStaleAsync(queueMessageDTO, cancellationToken))
        {
            return;
        }

        var jobId = queueMessageDTO.JobId;
        var job = await _trendReportJobRepo.GetByIdAsync(queueMessageDTO.UserId, jobId, cancellationToken);

        if(job is null)
        {
            return;
        }

        if(!await _trendReportJobRepo.TryStartProcessingAsync(
            queueMessageDTO.UserId,
            jobId,
            queueMessageDTO.DataVersion,
            cancellationToken))
        {
            return;
        }

        if (await StopIfQueueMessageIsStaleAsync(queueMessageDTO, cancellationToken))
        {
            return;
        }

        try
        {
            await DelayForDemoAsync(cancellationToken);

            if (await StopIfQueueMessageIsStaleAsync(queueMessageDTO, cancellationToken))
            {
                return;
            }

            var updated = await _trendReportJobRepo.TryUpdateProgressIfCurrentProcessingAsync(
                queueMessageDTO.UserId,
                jobId,
                queueMessageDTO.DataVersion,
                progressPercent: 45,
                currentStage: "正在计算训练周期报告",
                cancellationToken);

            if (!updated)
            {
                return;
            }

            await DelayForDemoAsync(cancellationToken);

            if (await StopIfQueueMessageIsStaleAsync(queueMessageDTO, cancellationToken))
            {
                return;
            }

            var result = GenerateResult(job.Request, job.Snapshot);

            updated = await _trendReportJobRepo.TryUpdateProgressIfCurrentProcessingAsync(
                queueMessageDTO.UserId,
                jobId,
                queueMessageDTO.DataVersion,
                progressPercent: 80,
                currentStage: "正在整理图表数据",
                cancellationToken);

            if (!updated)
            {
                return;
            }

            await DelayForDemoAsync(cancellationToken);

            if (await StopIfQueueMessageIsStaleAsync(queueMessageDTO, cancellationToken))
            {
                return;
            }

            await _trendReportJobRepo.TryCompleteIfCurrentProcessingAsync(
                queueMessageDTO.UserId,
                job.Id,
                queueMessageDTO.DataVersion,
                result,
                cancellationToken);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            await _trendReportJobRepo.TryMarkFailedIfCurrentProcessingAsync(
                queueMessageDTO.UserId,
                job.Id,
                queueMessageDTO.DataVersion,
                cancellationToken);

            throw;
        }
    }
    
    public async Task<TrendReportJobDto?> GetByIdAsync(int userId, int id)
    {
        ValidateUserId(userId);
        var job = await _trendReportJobRepo.GetByIdAsync(userId, id);
        return job is null || job.UserId != userId ? null : ToDto(job);
    }

    public async Task<TrendReportResultDto> GenerateResultAsync(int userId, CreateTrendReportRequestDto request)
    {
        ValidateUserId(userId);
        var validatedTrendReportReq = ValidateRequest(request);
        var snapshot = await LoadSnapshotAsync(userId, validatedTrendReportReq);
        return GenerateResult(validatedTrendReportReq, snapshot);
    }

    #region: Private Helper Methods

    private static TrendReportQueueMessageDto CreateQueueMessageDTO(TrendReportJob job)
    {
        var runId = Guid.NewGuid().ToString("N");
        return new TrendReportQueueMessageDto(
            job.Id,
            $"trend-report:{runId}",
            job.UserId,
            job.Request.StartWeek.ToString("yyyy-MM-dd"),
            job.Request.EndWeek.AddDays(6).ToString("yyyy-MM-dd"),
            job.DataVersion,
            job.CreatedAtUtc);
    }

    private async Task<bool> StopIfQueueMessageIsStaleAsync(TrendReportQueueMessageDto message, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        
        var latestJob = await _trendReportJobRepo.GetByIdAsync(message.UserId, message.JobId, cancellationToken);

        if (latestJob is null)
        {
            return true;
        }

        if (latestJob.Status == TrendReportJobStatuses.CancelRequested )
        {
            await _trendReportJobRepo.TryMarkSupersededIfCancelRequestedAsync(
                message.UserId,
                latestJob.Id,
                message.DataVersion,
                cancellationToken);

            return true;
        }

        if (latestJob.Status is TrendReportJobStatuses.Cancelled
            or TrendReportJobStatuses.Superseded)
        {
            return true;
        }

        if (latestJob.DataVersion != message.DataVersion)
        {
            await _trendReportJobRepo.TryMarkSupersededIfCurrentAsync(
                message.UserId,
                latestJob.Id,
                expectedDataVersion: message.DataVersion,
                cancellationToken);

            return true;
        }

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
        var snapshotStart = request.ComparisonStartWeek.HasValue
            ? Min(request.StartWeek, request.ComparisonStartWeek.Value)
            : request.StartWeek;
        var rangeEnd = request.ComparisonEndWeek.HasValue
            ? Max(request.EndWeek, request.ComparisonEndWeek.Value).AddDays(6)
            : request.EndWeek.AddDays(6);
        var trainingDays = await _trainingRepo.GetByDateRangeAsync(
            userId,
            snapshotStart,
            rangeEnd);
        var preCheckLogs = await _preCheckRepo.GetByDateRangeAsync(
            userId,
            snapshotStart,
            rangeEnd);

        return new TrendReportReqSnapshot(trainingDays, preCheckLogs);
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

    private static string CreateTrendReportReqFingerprint(
        TrendReportRequest request,
        TrendReportReqSnapshot snapshot,
        string dataVersion)
    {
        var fingerprintSource = string.Join(
            "\n",
            request.StartWeek.ToString("yyyy-MM-dd"),
            request.EndWeek.ToString("yyyy-MM-dd"),
            request.ComparisonStartWeek?.ToString("yyyy-MM-dd") ?? string.Empty,
            request.ComparisonEndWeek?.ToString("yyyy-MM-dd") ?? string.Empty,
            dataVersion,
            JsonSerializer.Serialize(snapshot, FingerprintJsonOptions));

        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fingerprintSource)))
            .ToLowerInvariant();
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
                log => GetSleepHours(log.SleepQuality)),
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
            .GroupBy(session => session.Date)
            .Select(group => group.OrderByDescending(session => session.UpdatedAt).First())
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
                        set.IsWarmup))).ToList(),
                session.UpdatedAtUtc)))
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

    private static decimal GetSleepHours(int sleepQuality)
    {
        return sleepQuality switch
        {
            1 => 4.5m,
            2 => 5.5m,
            3 => 6.5m,
            4 => 7.25m,
            _ => 8m,
        };
    }

    private static DateOnly Min(DateOnly first, DateOnly second)
    {
        return first <= second ? first : second;
    }

    private static DateOnly Max(DateOnly first, DateOnly second)
    {
        return first >= second ? first : second;
    }

    private static void ValidateUserId(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentException("User id must be positive.");
        }
    }

    private static TrendReportJobDto ToDto(TrendReportJob job)
    {
        return new TrendReportJobDto(
            job.Id,
            job.DataVersion,
            job.ReportFingerprint,
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
        IReadOnlyList<ReportTrainingSet> Sets,
        DateTimeOffset UpdatedAt);

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
