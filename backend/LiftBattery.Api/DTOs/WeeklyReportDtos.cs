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
    string? LastPeriodKey,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record UpdateWeeklyReportScheduleRequestDto(
    bool Enabled,
    string? DayOfWeek,
    string TimeOfDay,
    string RecipientEmail,
    string? TimeZoneId);

public sealed record WeeklyReportQueueMessageDto(
    string ScheduleId,
    string PeriodKey);
