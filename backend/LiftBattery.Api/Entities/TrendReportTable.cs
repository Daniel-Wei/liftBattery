using Azure.Data.Tables;
using Azure;
using LiftBattery.Api.Models;


namespace LiftBattery.Api.Entities;

public sealed class TrendReportJobEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
    public string Status { get; set; } = TrendReportJobStatuses.Queued;
    public int UserId { get; set; }
    public int ProgressPercent { get; set; }
    public string CurrentStage { get; set; } = string.Empty;
    public string RunId { get; set; } = string.Empty;
    public string DataVersion { get; set; } = string.Empty;
    public string RequestJson { get; set; } = string.Empty;
    public string? ResultBlobName { get; set; }
    public string? ErrorMessage { get; set; }
    public int EnqueueRecoveryAttemptCount { get; set; }
    public DateTimeOffset? LastEnqueueRecoveryAttemptAtUtc { get; set; }
    public string? LastEnqueueRecoveryError { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? StartedAtUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}

public sealed class TrendReportJobDedupEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
    public Guid JobId { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
}

public sealed class TrendReportActiveJobEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
    public Guid JobId { get; set; }
    public string RunId { get; set; } = string.Empty;
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
