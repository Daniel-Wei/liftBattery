namespace LiftBattery.Api.Entities;

public sealed class WeeklyReportDelivery
{
    public long Id { get; set; }
    public string ScheduleId { get; set; } = string.Empty;
    public string PeriodKey { get; set; } = string.Empty;
    public DateOnly ReportingPeriodStart { get; set; }
    public DateOnly ReportingPeriodEnd { get; set; }
    public string Status { get; set; } = LiftBattery.Api.Models.WeeklyReportDeliveryStatuses.Pending;
    public string? RecipientEmail { get; set; }
    public string? SourceDataVersion { get; set; }
    public DateTimeOffset? DataSampledAtUtc { get; set; }
    public DateTimeOffset? GeneratedAtUtc { get; set; }
    public string? BlobPath { get; set; }
    public DateTimeOffset? SentAtUtc { get; set; }
    public string? ProcessingClaimId { get; set; }
    public DateTimeOffset? ProcessingLeaseUntilUtc { get; set; }
    public string? LastError { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }

    public WeeklyReportSchedule Schedule { get; set; } = null!;
}
