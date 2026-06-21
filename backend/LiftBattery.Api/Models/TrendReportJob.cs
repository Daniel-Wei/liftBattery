using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Models;

public static class TrendReportJobStatuses
{
    public const string Queued = "Queued";
    public const string Processing = "Processing";
    public const string Completed = "Completed";
    public const string Failed = "Failed";
    public const string Cancelled = "Cancelled";
}

public sealed record TrendReportRequest(
    DateOnly StartWeek,
    DateOnly EndWeek,
    IReadOnlyList<TrendReportSelectionDto> Selections,
    IReadOnlyList<string> ReportTypes);

public sealed record TrendReportSnapshot(
    IReadOnlyList<TrainingSession> TrainingSessions,
    IReadOnlyList<PreCheckLog> PreCheckLogs);

public sealed record TrendReportJob(
    string Id,
    string Status,
    int ProgressPercent,
    string CurrentStage,
    TrendReportRequest Request,
    TrendReportSnapshot Snapshot,
    TrendReportResultDto? Result,
    string? ErrorMessage,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset UpdatedAtUtc);
