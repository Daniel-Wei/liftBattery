namespace LiftBattery.Api.DTOs;

public sealed record CreateTrendReportRequestDto(
    string StartWeek,
    string EndWeek,
    string? ComparisonStartWeek,
    string? ComparisonEndWeek);

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

public sealed record TrendReportSummaryCardDto(
    string Type,
    string Title,
    decimal Value,
    decimal? ComparisonValue,
    decimal? ChangePercent,
    string Unit,
    string Variant,
    IReadOnlyList<decimal> SparklineValues);

public sealed record TrendReportResultDto(
    string StartWeek,
    string EndWeek,
    string? ComparisonStartWeek,
    string? ComparisonEndWeek,
    IReadOnlyList<string> WeekLabels,
    IReadOnlyList<TrendReportSummaryCardDto> SummaryCards,
    MuscleStimulationReportDto? MuscleStimulation);

public sealed record TrendReportJobDto(
    Guid Id,
    string RunId,
    string DataVersion,
    string Status,
    int ProgressPercent,
    string CurrentStage,
    string? ErrorMessage,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    TrendReportResultDto? Result);

public sealed record TrendReportQueueMessageDto(
    Guid JobId,
    string RunId,
    int UserId,
    string PeriodStart,
    string PeriodEnd,
    string DataVersion,
    DateTimeOffset RequestedAtUtc);
