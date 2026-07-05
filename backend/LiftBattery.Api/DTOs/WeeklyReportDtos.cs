namespace LiftBattery.Api.DTOs;

public sealed record WeeklyReportScheduleDto(
    int UserId,
    bool Enabled,
    string ScheduledTime,
    string RecipientEmail,
    string Timezone,
    string ReportType,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    int DataVersion);

public sealed record UpdateWeeklyReportScheduleRequestDto(
    bool Enabled,
    string ScheduledTime,
    string RecipientEmail,
    string? Timezone);

public sealed record WeeklyReportQueueMessageDto(
    int DataVersion,
    string MessageType,
    int UserId,
    string ReportType,
    string WeekStartDate,
    string WeekEndDate,
    string ScheduledTime,
    string Timezone,
    string RecipientEmail,
    string IdempotencyKey,
    string CorrelationId,
    DateTimeOffset RequestedAtUtc);
