namespace LiftBattery.Api.DTOs;

public sealed record TrendReportSelectionDto(
    string MuscleGroup,
    string ExerciseName);

public sealed record CreateTrendReportRequestDto(
    string StartWeek,
    string EndWeek,
    IReadOnlyList<TrendReportSelectionDto> Selections,
    IReadOnlyList<string> ReportTypes);

public sealed record TrendReportPointDto(
    string Label,
    decimal Value);

public sealed record TrendReportSeriesDto(
    string Id,
    string Label,
    string? Detail,
    string Variant,
    IReadOnlyList<TrendReportPointDto> Data);

public sealed record TrendReportChartDto(
    string Type,
    string Title,
    IReadOnlyList<TrendReportSeriesDto> Series);

public sealed record MuscleStimulationItemDto(
    string Muscle,
    decimal Score,
    decimal Percentage,
    decimal Change,
    string Level);

public sealed record MuscleStimulationReportDto(
    decimal TotalScore,
    decimal ChangeFromPreviousPeriod,
    int HighStimulusMuscleCount,
    int LowStimulusMuscleCount,
    IReadOnlyList<MuscleStimulationItemDto> Muscles);

public sealed record TrendReportResultDto(
    string StartWeek,
    string EndWeek,
    IReadOnlyList<string> WeekLabels,
    IReadOnlyList<TrendReportChartDto> Charts,
    MuscleStimulationReportDto? MuscleStimulation);

public sealed record TrendReportJobDto(
    int Id,
    string Status,
    int ProgressPercent,
    string CurrentStage,
    string? ErrorMessage,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    TrendReportResultDto? Result);
