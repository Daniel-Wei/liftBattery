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
    private static readonly HashSet<string> SupportedReportTypes = new(StringComparer.Ordinal)
    {
        "readiness",
        "sleep",
        "sessionLoad",
        "volume",
        "estimatedPr",
        "muscleStimulation",
    };

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

    private static readonly string[] SeriesVariants =
    {
        "blue",
        "green",
        "amber",
        "purple",
        "dark",
    };

    private static readonly JsonSerializerOptions FingerprintJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ITrendReportJobRepository _jobRepository;
    private readonly ITrainingRepository _trainingRepository;
    private readonly IPreCheckRepository _preCheckRepository;
    private readonly ITrendReportServiceBusQueue _queue;
    private readonly int _demoDelayMilliseconds;

    public TrendReportService(
        ITrendReportJobRepository jobRepository,
        ITrainingRepository trainingRepository,
        IPreCheckRepository preCheckRepository,
        ITrendReportServiceBusQueue queue,
        IConfiguration configuration)
    {
        _jobRepository = jobRepository;
        _trainingRepository = trainingRepository;
        _preCheckRepository = preCheckRepository;
        _queue = queue;
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
    public async Task<TrendReportJobDto> CreateAsync(int userId, CreateTrendReportRequestDto request)
    {
        ValidateUserId(userId);
        // Validate and normalize the request DTO.
        var validatedRequest = ValidateRequest(request);

        // Load the database records used for the submission-time snapshot.
        var snapshotStart = validatedRequest.ComparisonStartWeek.HasValue
            ? Min(validatedRequest.StartWeek, validatedRequest.ComparisonStartWeek.Value)
            : validatedRequest.StartWeek;
        var rangeEnd = validatedRequest.ComparisonEndWeek.HasValue
            ? Max(validatedRequest.EndWeek, validatedRequest.ComparisonEndWeek.Value).AddDays(6)
            : validatedRequest.EndWeek.AddDays(6);
        var trainingDays = await _trainingRepository.GetByDateRangeAsync(
            userId,
            snapshotStart,
            rangeEnd);
        var preCheckLogs = await _preCheckRepository.GetByDateRangeAsync(
            userId,
            snapshotStart,
            rangeEnd);
        var snapshot = new TrendReportSnapshot(trainingDays, preCheckLogs);
        var reportFingerprint = CreateReportFingerprint(validatedRequest, snapshot);
        var activeJobs = await _jobRepository.GetActiveByUserIdAsync(userId);
        var existingActiveJob = activeJobs
            .Where(job => job.ReportFingerprint == reportFingerprint)
            .OrderByDescending(job => job.CreatedAtUtc)
            .FirstOrDefault();

        if (existingActiveJob is not null)
        {
            return ToDto(existingActiveJob);
        }

        var now = DateTimeOffset.UtcNow;

        foreach (var activeJob in activeJobs)
        {
            await _jobRepository.UpdateAsync(activeJob with
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
            validatedRequest,
            reportFingerprint,
            // The request stores user selections; the snapshot stores database data at submission time.
            snapshot,
            null,
            null,
            now,
            null,
            null,
            now);

        // Persist the initial Queued job before publishing its message.
        await _jobRepository.CreateAsync(job);

        try
        {
            // Publish only the job ID; the consumer loads the full job from Azure Table Storage.
            await _queue.EnqueueAsync(job.Id);
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
            await _jobRepository.UpdateAsync(failedJob);
            throw;
        }

        return ToDto(job);
    }

    public async Task<TrendReportJobDto?> GetByIdAsync(int userId, int id)
    {
        ValidateUserId(userId);
        var job = await _jobRepository.GetByIdAsync(id);
        return job is null || job.UserId != userId ? null : ToDto(job);
    }

    // Asynchronous consumer path:
    // 1. atomically claim an eligible job and mark it Processing
    // 2. update progress, calculate the report, and persist the completed result
    // 3. on failure, persist Failed and rethrow so Service Bus can redeliver the message
    public async Task ProcessAsync(int jobId)
    {
        var job = await _jobRepository.TryStartProcessingAsync(jobId, DateTimeOffset.UtcNow);

        if (job is null)
        {
            return;
        }

        try
        {
            await DelayForDemoAsync();

            if (await IsCancelledAsync(job.Id))
            {
                return;
            }

            job = job with
            {
                ProgressPercent = 45,
                CurrentStage = "正在计算训练周期报告",
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };
            await _jobRepository.UpdateAsync(job);
            await DelayForDemoAsync();

            if (await IsCancelledAsync(job.Id))
            {
                return;
            }

            var result = GenerateResult(job.Request, job.Snapshot);

            job = job with
            {
                ProgressPercent = 80,
                CurrentStage = "正在整理图表数据",
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };
            await _jobRepository.UpdateAsync(job);
            await DelayForDemoAsync();

            if (await IsCancelledAsync(job.Id))
            {
                return;
            }

            var completedAt = DateTimeOffset.UtcNow;
            job = job with
            {
                Status = TrendReportJobStatuses.Completed,
                ProgressPercent = 100,
                CurrentStage = "报告已生成",
                Result = result,
                CompletedAtUtc = completedAt,
                UpdatedAtUtc = completedAt,
            };
            await _jobRepository.UpdateAsync(job);
        }
        catch (Exception exception)
        {
            var failedJob = job with
            {
                Status = TrendReportJobStatuses.Failed,
                CurrentStage = "报告生成失败，等待消息重试",
                ErrorMessage = exception.Message,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };
            await _jobRepository.UpdateAsync(failedJob);
            throw;
        }
    }

    private async Task<bool> IsCancelledAsync(int jobId)
    {
        var latestJob = await _jobRepository.GetByIdAsync(jobId);
        return latestJob?.Status == TrendReportJobStatuses.Cancelled;
    }

    private Task DelayForDemoAsync()
    {
        return _demoDelayMilliseconds == 0
            ? Task.CompletedTask
            : Task.Delay(_demoDelayMilliseconds);
    }

    private static TrendReportRequest ValidateRequest(CreateTrendReportRequestDto request)
    {
        if (!DateOnly.TryParse(request.StartWeek, out var startWeek)
            || !DateOnly.TryParse(request.EndWeek, out var endWeek))
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

        if (!string.IsNullOrWhiteSpace(request.ComparisonStartWeek)
            || !string.IsNullOrWhiteSpace(request.ComparisonEndWeek))
        {
            if (!DateOnly.TryParse(request.ComparisonStartWeek, out var parsedComparisonStartWeek)
                || !DateOnly.TryParse(request.ComparisonEndWeek, out var parsedComparisonEndWeek))
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

        var selections = request.Selections
            .Where(selection => SupportedMuscleGroups.Contains(selection.MuscleGroup))
            .Where(selection => !string.IsNullOrWhiteSpace(selection.ExerciseName))
            .DistinctBy(selection => $"{selection.MuscleGroup}::{selection.ExerciseName}")
            .ToList();

        if (selections.Count == 0)
        {
            throw new ArgumentException("At least one muscle and exercise selection is required.");
        }

        var reportTypes = request.ReportTypes
            .Where(SupportedReportTypes.Contains)
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (reportTypes.Count == 0)
        {
            throw new ArgumentException("At least one report type is required.");
        }

        return new TrendReportRequest(startWeek, endWeek, comparisonStartWeek, comparisonEndWeek, selections, reportTypes);
    }

    private static string CreateReportFingerprint(TrendReportRequest request, TrendReportSnapshot snapshot)
    {
        var normalizedSelections = request.Selections
            .OrderBy(selection => selection.MuscleGroup, StringComparer.Ordinal)
            .ThenBy(selection => selection.ExerciseName, StringComparer.Ordinal)
            .Select(selection => $"{selection.MuscleGroup}:{selection.ExerciseName}");
        var normalizedReportTypes = request.ReportTypes
            .OrderBy(reportType => reportType, StringComparer.Ordinal);
        var fingerprintSource = string.Join(
            "\n",
            request.StartWeek.ToString("yyyy-MM-dd"),
            request.EndWeek.ToString("yyyy-MM-dd"),
            request.ComparisonStartWeek?.ToString("yyyy-MM-dd") ?? string.Empty,
            request.ComparisonEndWeek?.ToString("yyyy-MM-dd") ?? string.Empty,
            string.Join("|", normalizedSelections),
            string.Join("|", normalizedReportTypes),
            JsonSerializer.Serialize(snapshot, FingerprintJsonOptions));

        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(fingerprintSource)))
            .ToLowerInvariant();
    }

    private static TrendReportResultDto GenerateResult(
        TrendReportRequest request,
        TrendReportSnapshot snapshot)
    {
        var reportPeriods = BuildReportPeriods(request);
        var selectionKeys = request.Selections
            .Select(selection => GetSelectionKey(selection.MuscleGroup, selection.ExerciseName))
            .ToHashSet(StringComparer.Ordinal);
        var trainingSessions = ToReportSessions(snapshot.TrainingDays);
        var filteredSessions = trainingSessions
            .Select(session => session with
            {
                Sets = session.Sets
                    .Where(set => selectionKeys.Contains(GetSelectionKey(set.MuscleGroup, set.ExerciseName)))
                    .ToList(),
            })
            .Where(session => session.Sets.Count > 0)
            .ToList();
        var charts = new List<TrendReportChartDto>();
        MuscleStimulationReportDto? muscleStimulation = null;

        if (request.ReportTypes.Contains("readiness", StringComparer.Ordinal))
        {
            charts.Add(CreatePreCheckChart(
                "readiness",
                "练前状态分数趋势",
                "练前状态",
                "blue",
                reportPeriods,
                snapshot.PreCheckLogs,
                GetReadinessScore));
        }

        if (request.ReportTypes.Contains("sleep", StringComparer.Ordinal))
        {
            charts.Add(CreatePreCheckChart(
                "sleep",
                "睡眠时长趋势",
                "睡眠时长",
                "green",
                reportPeriods,
                snapshot.PreCheckLogs,
                log => GetSleepHours(log.SleepQuality)));
        }

        if (request.ReportTypes.Contains("sessionLoad", StringComparer.Ordinal))
        {
            charts.Add(CreateSessionLoadChart(reportPeriods, filteredSessions));
        }

        if (request.ReportTypes.Contains("volume", StringComparer.Ordinal))
        {
            charts.Add(CreateVolumeChart(reportPeriods, filteredSessions));
        }

        if (request.ReportTypes.Contains("estimatedPr", StringComparer.Ordinal))
        {
            charts.Add(CreateEstimatedPrChart(reportPeriods, trainingSessions, request.Selections));
        }

        if (request.ReportTypes.Contains("muscleStimulation", StringComparer.Ordinal))
        {
            muscleStimulation = CreateMuscleStimulationReport(
                request.StartWeek,
                request.EndWeek,
                request.ComparisonStartWeek,
                request.ComparisonEndWeek,
                filteredSessions);
        }

        return new TrendReportResultDto(
            request.StartWeek.ToString("yyyy-MM-dd"),
            request.EndWeek.ToString("yyyy-MM-dd"),
            request.ComparisonStartWeek?.ToString("yyyy-MM-dd"),
            request.ComparisonEndWeek?.ToString("yyyy-MM-dd"),
            reportPeriods.Select(period => period.Label).ToList(),
            charts,
            muscleStimulation);
    }

    private static TrendReportChartDto CreatePreCheckChart(
        string type,
        string title,
        string seriesLabel,
        string variant,
        IReadOnlyList<ReportWeek> weeks,
        IReadOnlyList<PreCheckModel> logs,
        Func<PreCheckModel, decimal> getValue)
    {
        var points = weeks.SelectMany(week =>
        {
            var weekLogs = logs
                .Where(log => log.Date >= week.StartDate && log.Date <= week.EndDate)
                .ToList();

            if (weekLogs.Count == 0)
            {
                return Array.Empty<TrendReportPointDto>();
            }

            return new[]
            {
                new TrendReportPointDto(
                    week.Label,
                    Math.Round(weekLogs.Average(getValue), 1)),
            };
        }).ToList();

        return new TrendReportChartDto(
            type,
            title,
            new[] { new TrendReportSeriesDto(type, seriesLabel, null, variant, points) });
    }

    private static TrendReportChartDto CreateSessionLoadChart(
        IReadOnlyList<ReportWeek> weeks,
        IReadOnlyList<ReportTrainingSession> sessions)
    {
        var latestSessionPerDay = sessions
            .GroupBy(session => session.Date)
            .Select(group => group.OrderByDescending(session => session.UpdatedAt).First())
            .ToList();
        var points = weeks.Select(week => new TrendReportPointDto(
            week.Label,
            latestSessionPerDay
                .Where(session => session.Date >= week.StartDate && session.Date <= week.EndDate)
                .Sum(session => session.DurationMinutes * session.SessionRpe)))
            .Where(point => point.Value > 0)
            .ToList();

        return new TrendReportChartDto(
            "sessionLoad",
            "所选肌群与动作的训练周期负荷",
            new[] { new TrendReportSeriesDto("session-load", "训练负荷", null, "dark", points) });
    }

    private static TrendReportChartDto CreateVolumeChart(
        IReadOnlyList<ReportWeek> weeks,
        IReadOnlyList<ReportTrainingSession> sessions)
    {
        var points = weeks.Select(week => new TrendReportPointDto(
            week.Label,
            sessions
                .Where(session => session.Date >= week.StartDate && session.Date <= week.EndDate)
                .SelectMany(session => session.Sets)
                .Sum(set => set.Reps * set.WeightKg)))
            .Where(point => point.Value > 0)
            .ToList();

        return new TrendReportChartDto(
            "volume",
            "所选肌群与动作的训练周期训练量",
            new[] { new TrendReportSeriesDto("volume", "训练量", null, "amber", points) });
    }

    private static TrendReportChartDto CreateEstimatedPrChart(
        IReadOnlyList<ReportWeek> weeks,
        IReadOnlyList<ReportTrainingSession> sessions,
        IReadOnlyList<TrendReportSelectionDto> selections)
    {
        var series = selections.Select((selection, index) =>
        {
            var points = weeks.SelectMany(week =>
            {
                var estimates = sessions
                    .Where(session => session.Date >= week.StartDate && session.Date <= week.EndDate)
                    .SelectMany(session => session.Sets)
                    .Where(set => set.MuscleGroup == selection.MuscleGroup)
                    .Where(set => set.ExerciseName == selection.ExerciseName)
                    .Where(set => !set.IsWarmup && set.WeightKg > 0 && set.Reps > 0)
                    .Select(set => set.WeightKg * (1 + (set.Reps / 30m)))
                    .ToList();

                return estimates.Count == 0
                    ? Array.Empty<TrendReportPointDto>()
                    : new[]
                    {
                        new TrendReportPointDto(week.Label, Math.Round(estimates.Max(), 0)),
                    };
            }).ToList();

            return new TrendReportSeriesDto(
                GetSelectionKey(selection.MuscleGroup, selection.ExerciseName),
                selection.ExerciseName,
                selection.MuscleGroup,
                SeriesVariants[index % SeriesVariants.Length],
                points);
        })
        .Where(item => item.Data.Count > 0)
        .ToList();

        return new TrendReportChartDto(
            "estimatedPr",
            "动作预计单次最大重量趋势",
            series);
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

    private static string GetSelectionKey(string muscleGroup, string exerciseName)
    {
        return $"{muscleGroup}::{exerciseName}";
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
}
