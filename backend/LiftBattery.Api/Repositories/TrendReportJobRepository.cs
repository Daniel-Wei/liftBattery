using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Repositories;

public sealed class TrendReportJobRepository : ITrendReportJobRepository
{
    private const string PartitionKeyValue = "trend-report";
    private readonly TableClient _tableClient;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    // Uses the AzureWebJobsStorage connection setting to access Azure Table Storage.
    public TrendReportJobRepository(IConfiguration configuration)
    {
        var connectionString = configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var tableName = configuration["TrendReportTableName"] ?? "TrendReportJobs";
        _tableClient = new TableClient(connectionString, tableName);
    }

    // Persists the initial job as an Azure Table entity.
    public async Task<TrendReportJob> CreateAsync(TrendReportJob job)
    {
        await EnsureTableAsync();
        await _tableClient.AddEntityAsync(ToEntity(job));
        return job;
    }

    // Atomically claims an eligible job by marking it Processing; the ETag prevents concurrent claims.
    public async Task<TrendReportJob?> TryStartProcessingAsync(
        int id,
        DateTimeOffset startedAtUtc)
    {
        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<TrendReportJobEntity>(PartitionKeyValue, id.ToString());
            var entity = response.Value;
            var processingIsFresh = entity.Status == TrendReportJobStatuses.Processing
                && entity.UpdatedAtUtc > startedAtUtc.AddMinutes(-10);

            if (entity.Status is TrendReportJobStatuses.Completed or TrendReportJobStatuses.Cancelled
                || processingIsFresh)
            {
                return null;
            }

            entity.Status = TrendReportJobStatuses.Processing;
            entity.ProgressPercent = 15;
            entity.CurrentStage = "正在读取报告配置";
            entity.ErrorMessage = null;
            entity.StartedAtUtc ??= startedAtUtc;
            entity.UpdatedAtUtc = startedAtUtc;
            await _tableClient.UpdateEntityAsync(entity, entity.ETag, TableUpdateMode.Replace);
            return ToModel(entity);
        }
        catch (RequestFailedException exception) when (exception.Status is 404 or 412)
        {
            return null;
        }
    }

    public async Task<TrendReportJob?> GetByIdAsync(int id)
    {
        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<TrendReportJobEntity>(PartitionKeyValue, id.ToString());
            return ToModel(response.Value);
        }
        catch (RequestFailedException exception) when (exception.Status == 404)
        {
            return null;
        }
    }

    // Replaces the current job entity in Azure Table Storage.
    public async Task<TrendReportJob> UpdateAsync(TrendReportJob job)
    {
        await EnsureTableAsync();
        await _tableClient.UpsertEntityAsync(ToEntity(job), TableUpdateMode.Replace);
        return job;
    }

    private Task EnsureTableAsync()
    {
        return _tableClient.CreateIfNotExistsAsync();
    }

    private TrendReportJobEntity ToEntity(TrendReportJob job)
    {
        return new TrendReportJobEntity
        {
            PartitionKey = PartitionKeyValue,
            RowKey = job.Id.ToString(),
            Status = job.Status,
            ProgressPercent = job.ProgressPercent,
            CurrentStage = job.CurrentStage,
            RequestJson = JsonSerializer.Serialize(job.Request, _jsonOptions),
            SnapshotJson = JsonSerializer.Serialize(job.Snapshot, _jsonOptions),
            ResultJson = job.Result is null
                ? null
                : JsonSerializer.Serialize(job.Result, _jsonOptions),
            ErrorMessage = job.ErrorMessage,
            CreatedAtUtc = job.CreatedAtUtc,
            StartedAtUtc = job.StartedAtUtc,
            CompletedAtUtc = job.CompletedAtUtc,
            UpdatedAtUtc = job.UpdatedAtUtc,
        };
    }

    private TrendReportJob ToModel(TrendReportJobEntity entity)
    {
        var request = JsonSerializer.Deserialize<TrendReportRequest>(entity.RequestJson, _jsonOptions)
            ?? throw new InvalidOperationException("Report job request is invalid.");
        var snapshot = JsonSerializer.Deserialize<TrendReportSnapshot>(entity.SnapshotJson, _jsonOptions)
            ?? throw new InvalidOperationException("Report job snapshot is invalid.");
        var result = string.IsNullOrWhiteSpace(entity.ResultJson)
            ? null
            : JsonSerializer.Deserialize<TrendReportResultDto>(entity.ResultJson, _jsonOptions);

        return new TrendReportJob(
            int.Parse(entity.RowKey),
            entity.Status,
            entity.ProgressPercent,
            entity.CurrentStage,
            request,
            snapshot,
            result,
            entity.ErrorMessage,
            entity.CreatedAtUtc,
            entity.StartedAtUtc,
            entity.CompletedAtUtc,
            entity.UpdatedAtUtc);
    }

    private sealed class TrendReportJobEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = PartitionKeyValue;
        public string RowKey { get; set; } = string.Empty;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
        public string Status { get; set; } = TrendReportJobStatuses.Queued;
        public int ProgressPercent { get; set; }
        public string CurrentStage { get; set; } = string.Empty;
        public string RequestJson { get; set; } = string.Empty;
        public string SnapshotJson { get; set; } = string.Empty;
        public string? ResultJson { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTimeOffset CreatedAtUtc { get; set; }
        public DateTimeOffset? StartedAtUtc { get; set; }
        public DateTimeOffset? CompletedAtUtc { get; set; }
        public DateTimeOffset UpdatedAtUtc { get; set; }
    }
}
