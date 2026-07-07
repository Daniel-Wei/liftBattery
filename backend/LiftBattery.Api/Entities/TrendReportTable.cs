using Azure.Data.Tables;
using Azure;
using LiftBattery.Api.Models;


namespace LiftBattery.Api.Entities;

public sealed class TrendReportJobEntity : ITableEntity
{
    public string PartitionKey { get; set; } = "trend-report";
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
    public string Status { get; set; } = TrendReportJobStatuses.Queued;
    public int UserId { get; set; }
    public int ProgressPercent { get; set; }
    public string CurrentStage { get; set; } = string.Empty;
    public string DataVersion { get; set; } = string.Empty;
    public string ReportFingerprint { get; set; } = string.Empty;
    public string RequestJson { get; set; } = string.Empty;
    public string SnapshotJson { get; set; } = string.Empty;
    public string? ResultJson { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? StartedAtUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
