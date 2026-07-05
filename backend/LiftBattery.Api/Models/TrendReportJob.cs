using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Models;

public static class TrendReportJobStatuses
{
    public const string Queued = "Queued";
    public const string Processing = "Processing";
    public const string Completed = "Completed";
    public const string Failed = "Failed";
    public const string Cancelled = "Cancelled";
    public const string Superseded = "Superseded";
    public const string CancelRequested = "CancelRequested";
}

public sealed record TrendReportRequest(
    DateOnly StartWeek,
    DateOnly EndWeek,
    DateOnly? ComparisonStartWeek,
    DateOnly? ComparisonEndWeek);

public sealed record TrendReportSnapshot(
    IReadOnlyList<TrainingDayModel> TrainingDays,
    IReadOnlyList<PreCheckModel> PreCheckLogs);

public sealed record TrendReportJob(
    int Id,
    int UserId,
    string Status,
    int ProgressPercent,
    string CurrentStage,
    TrendReportRequest Request,
    string DataVersion,
    string ReportFingerprint,
    TrendReportSnapshot Snapshot,
    TrendReportResultDto? Result,
    string? ErrorMessage,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    DateTimeOffset UpdatedAtUtc);
