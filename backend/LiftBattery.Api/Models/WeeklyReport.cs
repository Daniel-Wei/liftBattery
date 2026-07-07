using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Models;

public static class WeeklyReportConstants
{
    public const int DataVersion = 1;
    public const string ReportType = "WeeklyTrendsReport";
    public const string MessageType = "WeeklyTrendsReportRequested";
    public const string DefaultTimeZoneId = "UTC";
}

public static class WeeklyReportJobStatuses
{
    public const string Queued = "Queued";
    public const string Processing = "Processing";
    public const string Completed = "Completed";
    public const string Failed = "Failed";
    public const string Superseded = "Superseded";
}

public sealed class WeeklyReportSchedule
{
    public string ScheduleId { get; init; } = string.Empty;
    public int UserId { get; init; }
    public bool Enabled { get; init; }
    public DayOfWeek DayOfWeek { get; init; } = DayOfWeek.Monday;
    public TimeOnly TimeOfDay { get; init; } = new(8, 0);
    public string? TimeZoneId { get; init; } = WeeklyReportConstants.DefaultTimeZoneId;
    public string RecipientEmail { get; init; } = string.Empty;
    public DateTimeOffset? LastRunAtUtc { get; init; }
    public DateTimeOffset? NextRunAtUtc { get; init; }
    public string? LastRunKey { get; init; }
    public int? LastRequestedJobId { get; init; }
    public DateTimeOffset CreatedAtUtc { get; init; }
    public DateTimeOffset UpdatedAtUtc { get; init; }
}

public sealed record WeeklyReportJob(
    int Id,
    int UserId,
    string ScheduleId,
    string RunKey,
    string ReportType,
    DateOnly WeekStartDate,
    DateOnly WeekEndDate,
    DateTimeOffset ScheduledForUtc,
    string TimeZoneId,
    string RecipientEmail,
    int DataVersion,
    string Status,
    string CorrelationId,
    DateTimeOffset RequestedAtUtc,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? GeneratedAtUtc,
    DateTimeOffset? SentAtUtc,
    DateTimeOffset? CompletedAtUtc,
    string? BlobName,
    string? ErrorMessage,
    TrendReportResultDto? Result);
