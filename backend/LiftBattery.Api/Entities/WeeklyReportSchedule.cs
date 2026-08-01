namespace LiftBattery.Api.Entities;

public sealed class WeeklyReportSchedule
{
    public string ScheduleId { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public string TimeZoneId { get; set; } = "UTC";
    public DayOfWeek DayOfWeek { get; set; } = DayOfWeek.Monday;
    public TimeOnly LocalSendTime { get; set; } = new(8, 0);
    public bool Enabled { get; set; }
    public DateTimeOffset? NextRunAtUtc { get; set; }
    public DateTimeOffset? LastRunAtUtc { get; set; }
    public string? LastPeriodKey { get; set; }

    // Dispatcher lease fields. They protect only the SQL-to-Service-Bus handoff;
    // report processing has its own lease on WeeklyReportDelivery.
    public DateTimeOffset? LeaseUntilUtc { get; set; }
    public string? ClaimedBy { get; set; }
    public string? ClaimedPeriodKey { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
