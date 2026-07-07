namespace LiftBattery.Api.DTOs;

public sealed record WeeklyReportScheduleDto(
    string ScheduleId,
    int UserId,
    bool Enabled,
    string DayOfWeek,
    string TimeOfDay,
    string RecipientEmail,
    string TimeZoneId,
    DateTimeOffset? LastRunAtUtc,
    DateTimeOffset? NextRunAtUtc,
    string? LastRunKey,
    int? LastRequestedJobId,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record UpdateWeeklyReportScheduleRequestDto(
    bool Enabled,
    string? DayOfWeek,
    string TimeOfDay,
    string RecipientEmail,
    string? TimeZoneId);

public sealed record WeeklyReportJobDto(
    int Id,
    int UserId,
    string ScheduleId,
    string RunKey,
    string ReportType,
    string WeekStartDate,
    string WeekEndDate,
    DateTimeOffset ScheduledForUtc,
    string Status,
    string? ErrorMessage,
    DateTimeOffset RequestedAtUtc,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    DateTimeOffset? StartedAtUtc,
    DateTimeOffset? CompletedAtUtc);

public sealed record WeeklyReportQueueMessageDto(
    int JobId,
    int UserId,
    string ScheduleId,
    string RunKey,
    DateTimeOffset ScheduledForUtc);
