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

    private readonly ITrendReportJobRepository _jobRepository;
    private readonly ITrainingLogRepository _trainingRepository;
    private readonly IPreCheckRepository _preCheckRepository;
    private readonly ITrendReportQueue _queue;
    private readonly int _demoDelayMilliseconds;
    private readonly string _defaultUserId;

    public TrendReportService(
        ITrendReportJobRepository jobRepository,
        ITrainingLogRepository trainingRepository,
        IPreCheckRepository preCheckRepository,
        ITrendReportQueue queue,
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
        _defaultUserId = configuration["PreCheck:DefaultUserId"] ?? "demo-user";
    }

    // Synchronous producer path:
    // 1. validate the request and capture a submission-time data snapshot
    // 2. persist the initial Queued job in Azure Table Storage
    // 3. enqueue the job ID for background processing
    public async Task<TrendReportJobDto> CreateAsync(CreateTrendReportRequestDto request)
    {
        // Validate and normalize the request DTO.
        var validatedRequest = ValidateRequest(request);

        // Load the database records used for the submission-time snapshot.
        var rangeEnd = validatedRequest.EndWeek.AddDays(6);
        var trainingDays = await _trainingRepository.GetByDateRangeAsync(
            _defaultUserId,
            validatedRequest.StartWeek,
            rangeEnd);
        var preCheckLogs = await _preCheckRepository.GetByDateRangeAsync(
            validatedRequest.StartWeek,
            rangeEnd);
        var now = DateTimeOffset.UtcNow;
        var job = new TrendReportJob(
            Guid.NewGuid().ToString("N"),
            TrendReportJobStatuses.Queued,
            0,
            "等待后台处理",
            validatedRequest,
            // The request stores user selections; the snapshot stores database data at submission time.
            new TrendReportSnapshot(trainingDays, preCheckLogs),
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

    public async Task<TrendReportJobDto?> GetByIdAsync(string id)
    {
        var job = await _jobRepository.GetByIdAsync(id);
        return job is null ? null : ToDto(job);
    }

    // Asynchronous consumer path:
    // 1. atomically claim an eligible job and mark it Processing
    // 2. update progress, calculate the report, and persist the completed result
    // 3. on failure, persist Failed and rethrow so Service Bus can redeliver the message
    public async Task ProcessAsync(string jobId)
    {
        var job = await _jobRepository.TryStartProcessingAsync(jobId, DateTimeOffset.UtcNow);

        if (job is null)
        {
            return;
        }

        try
        {
            await DelayForDemoAsync();

            job = job with
            {
                ProgressPercent = 45,
                CurrentStage = "正在计算周趋势",
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };
            await _jobRepository.UpdateAsync(job);
            await DelayForDemoAsync();

            var result = GenerateResult(job.Request, job.Snapshot);

            job = job with
            {
                ProgressPercent = 80,
                CurrentStage = "正在整理图表数据",
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };
            await _jobRepository.UpdateAsync(job);
            await DelayForDemoAsync();

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

        return new TrendReportRequest(startWeek, endWeek, selections, reportTypes);
    }

    private static TrendReportResultDto GenerateResult(
        TrendReportRequest request,
        TrendReportSnapshot snapshot)
    {
        var weeks = BuildWeeks(request.StartWeek, request.EndWeek);
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

        if (request.ReportTypes.Contains("readiness", StringComparer.Ordinal))
        {
            charts.Add(CreatePreCheckChart(
                "readiness",
                "练前状态分数趋势",
                "练前状态",
                "blue",
                weeks,
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
                weeks,
                snapshot.PreCheckLogs,
                log => GetSleepHours(log.SleepQuality)));
        }

        if (request.ReportTypes.Contains("sessionLoad", StringComparer.Ordinal))
        {
            charts.Add(CreateSessionLoadChart(weeks, filteredSessions));
        }

        if (request.ReportTypes.Contains("volume", StringComparer.Ordinal))
        {
            charts.Add(CreateVolumeChart(weeks, filteredSessions));
        }

        if (request.ReportTypes.Contains("estimatedPr", StringComparer.Ordinal))
        {
            charts.Add(CreateEstimatedPrChart(weeks, trainingSessions, request.Selections));
        }

        return new TrendReportResultDto(
            request.StartWeek.ToString("yyyy-MM-dd"),
            request.EndWeek.ToString("yyyy-MM-dd"),
            weeks.Select(week => week.Label).ToList(),
            charts);
    }

    private static TrendReportChartDto CreatePreCheckChart(
        string type,
        string title,
        string seriesLabel,
        string variant,
        IReadOnlyList<ReportWeek> weeks,
        IReadOnlyList<PreCheckLog> logs,
        Func<PreCheckLog, decimal> getValue)
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
            "所选肌群与动作的每周训练负荷",
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
            "所选肌群与动作的每周训练量",
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
                        set.IsWarmup))).ToList(),
                session.UpdatedAtUtc)))
            .ToList();
    }

    private static decimal GetReadinessScore(PreCheckLog log)
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

    private static TrendReportJobDto ToDto(TrendReportJob job)
    {
        return new TrendReportJobDto(
            job.Id,
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
        bool IsWarmup);
}
