using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Models;

public static class WeeklyReportConstants
{
    public const int DataVersion = 1;
    public const string ReportType = "WeeklyTrendsReport";
    public const string MessageType = "WeeklyTrendsReportRequested";
}

public static class WeeklyReportJobStatuses
{
    public const string Pending = "Pending";
    public const string Processing = "Processing";
    public const string Generated = "Generated";
    public const string Sent = "Sent";
    public const string Failed = "Failed";
}

public sealed record WeeklyReportSchedule(
    int UserId,
    bool Enabled,
    TimeOnly ScheduledTime,
    string RecipientEmail,
    string Timezone,
    string ReportType,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    int DataVersion);

public sealed record WeeklyReportJob(
    string IdempotencyKey,
    int UserId,
    string ReportType,
    DateOnly WeekStartDate,
    DateOnly WeekEndDate,
    string ScheduledTime,
    string Timezone,
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
    string? BlobName,
    string? ErrorMessage,
    TrendReportResultDto? Result);
