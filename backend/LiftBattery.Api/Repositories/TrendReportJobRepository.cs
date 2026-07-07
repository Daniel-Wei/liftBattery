using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using LiftBattery.Api.Entities;

namespace LiftBattery.Api.Repositories;

public sealed class TrendReportJobRepository : ITrendReportJobRepository
{
    private const string PartitionKeyValue = "trend-report";
    private const string DataVersionPartitionKeyValue = "trend-report-data-version";
    private readonly TableClient _tableClient;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);
    private readonly ILogger<TrendReportJobRepository> _logger;

    // Uses the AzureWebJobsStorage connection setting to access Azure Table Storage.
    public TrendReportJobRepository(IConfiguration configuration, ILogger<TrendReportJobRepository> logger)
    {
        var connectionString = configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var tableName = configuration["TrendReportTableName"] ?? "TrendReportJobs";
        _tableClient = new TableClient(connectionString, tableName);
        _logger = logger;
    }

    #region: Create Async

    // Persists the initial job as an Azure Table entity.
    public async Task<TrendReportJob> CreateAsync(TrendReportJob job)
    {
        await EnsureTableAsync();
        await _tableClient.AddEntityAsync(ToEntity(job));
        return job;
    }

    #endregion

    #region: Data Version Management
    public async Task<string> GetOrCreateCurrentTrendReportReqDataVersionAsync(int userId)
    {
        await EnsureTableAsync();
        var rowKey = userId.ToString();

        try
        {
            var response =
                await _tableClient.GetEntityAsync<TrendReportDataVersionEntity>(
                    DataVersionPartitionKeyValue,
                    rowKey);

            return response.Value.DataVersion;
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            var now = DateTimeOffset.UtcNow;
            var initialVersion = CreateDataVersion(now);

            var entity = new TrendReportDataVersionEntity
            {
                PartitionKey = DataVersionPartitionKeyValue,
                RowKey = rowKey,
                UserId = userId,
                DataVersion = initialVersion,
                UpdatedAtUtc = now
            };

            try
            {
                await _tableClient.AddEntityAsync(entity);
                return initialVersion;
            }
            catch (RequestFailedException e) when (e.Status == 409)
            {
                var existing =
                    await _tableClient.GetEntityAsync<TrendReportDataVersionEntity>(
                        DataVersionPartitionKeyValue,
                        rowKey);

                return existing.Value.DataVersion;
            }
        }
    }

    public async Task<string> BumpDataVersionAsync(int userId, DateTimeOffset updatedAtUtc)
    {
        await EnsureTableAsync();

        var nextVersion = CreateDataVersion(updatedAtUtc);
        await _tableClient.UpsertEntityAsync(new TrendReportDataVersionEntity
        {
            PartitionKey = DataVersionPartitionKeyValue,
            RowKey = userId.ToString(),
            UserId = userId,
            DataVersion = nextVersion,
            UpdatedAtUtc = updatedAtUtc,
        }, TableUpdateMode.Replace);
        return nextVersion;
    }

    #endregion

    #region: Getters

    public async Task<TrendReportJob?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<TrendReportJobEntity>(
                PartitionKeyValue, 
                id.ToString(),
                cancellationToken: cancellationToken);
            return ToModel(response.Value);
        }
        catch (RequestFailedException exception) when (exception.Status == 404)
        {
            return null;
        }
    }

    public async Task<TrendReportJob?> GetLatestByUserIdAndFingerprintAsync(int userId, string reportFingerprint)
    {
        await EnsureTableAsync();

        var jobs = new List<TrendReportJob>();

        await foreach (var jobEntity in _tableClient.QueryAsync<TrendReportJobEntity>(
            entity => entity.PartitionKey == PartitionKeyValue
                && entity.UserId == userId
                && entity.ReportFingerprint == reportFingerprint))
        {
            jobs.Add(ToModel(jobEntity));
        }

        return jobs
            .OrderByDescending(job => job.CreatedAtUtc)
            .FirstOrDefault();
    }

    public async Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(int userId)
    {
        await EnsureTableAsync();

        var jobs = new List<TrendReportJob>();

        await foreach (var jobEntity in _tableClient.QueryAsync<TrendReportJobEntity>(
            entity => entity.PartitionKey == PartitionKeyValue && entity.UserId == userId))
        {
            if (jobEntity.Status is TrendReportJobStatuses.Queued or TrendReportJobStatuses.Processing)
            {
                jobs.Add(ToModel(jobEntity));
            }
        }

        return jobs;
    }


    #endregion

    #region: Processing State Update Methods 
    public Task<bool> TryStartProcessingAsync(
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            jobId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.Status == TrendReportJobStatuses.Queued
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Processing;
                entity.ProgressPercent = 15;
                entity.CurrentStage = "正在读取报告配置";
                entity.StartedAtUtc = now;
            },
            operationName: TrendReportRepositoryActions.StartProcessing,
            cancellationToken);
    }

    public Task<bool> TryUpdateProgressIfCurrentProcessingAsync(
        int jobId,
        string expectedDataVersion,
        int progressPercent,
        string currentStage,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            jobId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.Status == TrendReportJobStatuses.Processing
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.ProgressPercent = Math.Clamp(progressPercent, 0, 100);
                entity.CurrentStage = currentStage;
            },
            operationName: TrendReportRepositoryActions.UpdateProgress,
            cancellationToken);
    }

    public Task<bool> TryCompleteIfCurrentProcessingAsync(
        int jobId,
        string expectedDataVersion,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            jobId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.Status == TrendReportJobStatuses.Processing
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Completed;
                entity.ProgressPercent = 100;
                entity.CurrentStage = "训练报告生成完成";
                entity.ResultJson = JsonSerializer.Serialize(result, _jsonOptions);
                entity.ErrorMessage = null;
                entity.CompletedAtUtc = now;
            },
            operationName: TrendReportRepositoryActions.MarkCompleted,
            cancellationToken);
    }

    public Task<bool> TryMarkFailedIfCurrentProcessingAsync(
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            jobId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.Status == TrendReportJobStatuses.Processing,
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Failed;
                entity.ErrorMessage = "训练报告生成失败，请稍后重试或联系管理员。";
                entity.CompletedAtUtc = now;
            },
            operationName: TrendReportRepositoryActions.MarkFailed,
            cancellationToken);
    }

    public Task<bool> TryMarkSupersededIfCurrentAsync(
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            jobId,
            expectedDataVersion,
            entity =>
                entity.DataVersion != expectedDataVersion,
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Superseded;
                entity.CurrentStage = "已跳过：队列消息的数据版本已过期";
                entity.CompletedAtUtc = now;
            },
            operationName: TrendReportRepositoryActions.MarkSuperseded,
            cancellationToken);
    }

     public Task<bool> TryMarkSupersededIfStatusAsync(
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            jobId,
            expectedDataVersion,
            entity =>
                entity.Status == TrendReportJobStatuses.CancelRequested,
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Superseded;
                entity.CurrentStage = "已停止：训练数据已更新，请重新生成报告";
                entity.CompletedAtUtc = now;
            },
            operationName: TrendReportRepositoryActions.MarkSuperseded,
            cancellationToken);
    }

    private async Task<bool> TryUpdateEntityAsync(
        int jobId,
        string expectedDataVersion,
        Func<TrendReportJobEntity, bool> canUpdate,
        Action<TrendReportJobEntity, DateTimeOffset> applyUpdate,
        TrendReportRepositoryActions operationName,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        try
        {
            var response = await _tableClient.GetEntityIfExistsAsync<TrendReportJobEntity>(
                partitionKey: PartitionKeyValue,
                rowKey: jobId.ToString(),
                cancellationToken: cancellationToken);

            if (!response.HasValue || response.Value is null)
            {
                return false;
            }

            var entity = response.Value;

            if (!canUpdate(entity))
            {
                return false;
            }

            var now = DateTimeOffset.UtcNow;

            applyUpdate(entity, now);

            entity.UpdatedAtUtc = now;

            await _tableClient.UpdateEntityAsync(
                entity,
                entity.ETag,
                TableUpdateMode.Merge,
                cancellationToken);

            return true;
        }
        catch (RequestFailedException exception) when (exception.Status == 404)
        {
            return false;
        }
        catch (RequestFailedException exception) when (exception.Status == 412)
        {
            return false;
        }
        catch (RequestFailedException exception)
        {
            _logger.LogError(
                exception,
                "Failed to update trend report job. Operation={Operation}, JobId={JobId}, ExpectedDataVersion={ExpectedDataVersion}.",
                operationName,
                jobId,
                expectedDataVersion);

            return false;
        }
    }

    #endregion

    #region: Update Async   
    // Replaces the current job entity in Azure Table Storage.
    public async Task<TrendReportJob> UpdateAsync(TrendReportJob job)
    {
        await EnsureTableAsync();

        // Protect terminal jobs from being overwritten by stale workers.
        // If an old worker finishes after this job was cancelled or superseded, it must not change the job back to Processing, Completed, or Failed.
        if (job.Status is not TrendReportJobStatuses.Cancelled
            and not TrendReportJobStatuses.Superseded
            and not TrendReportJobStatuses.CancelRequested)
        {
            try
            {
                var current = await _tableClient.GetEntityAsync<TrendReportJobEntity>(
                    PartitionKeyValue,
                    job.Id.ToString());

                if (current.Value.Status is TrendReportJobStatuses.Cancelled
                    or TrendReportJobStatuses.Superseded
                    or TrendReportJobStatuses.CancelRequested)
                {
                    return ToModel(current.Value);
                }
            }
            catch (RequestFailedException exception) when (exception.Status == 404)
            {
                // Upsert below will create the row if it disappeared between reads.
            }
        }

        await _tableClient.UpsertEntityAsync(ToEntity(job), TableUpdateMode.Replace);
        return job;
    }

    #endregion

    #region: Private Helper Methods

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
            UserId = job.UserId,
            ProgressPercent = job.ProgressPercent,
            CurrentStage = job.CurrentStage,
            DataVersion = job.DataVersion,
            ReportFingerprint = job.ReportFingerprint,
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
        var snapshot = JsonSerializer.Deserialize<TrendReportReqSnapshot>(entity.SnapshotJson, _jsonOptions)
            ?? throw new InvalidOperationException("Report job snapshot is invalid.");
        var result = string.IsNullOrWhiteSpace(entity.ResultJson)
            ? null
            : JsonSerializer.Deserialize<TrendReportResultDto>(entity.ResultJson, _jsonOptions);

        return new TrendReportJob(
            int.Parse(entity.RowKey),
            entity.UserId,
            entity.Status,
            entity.ProgressPercent,
            entity.CurrentStage,
            request,
            string.IsNullOrWhiteSpace(entity.DataVersion) ? entity.ReportFingerprint : entity.DataVersion,
            entity.ReportFingerprint,
            snapshot,
            result,
            entity.ErrorMessage,
            entity.CreatedAtUtc,
            entity.StartedAtUtc,
            entity.CompletedAtUtc,
            entity.UpdatedAtUtc);
    }

    private static string CreateDataVersion(DateTimeOffset updatedAtUtc)
    {
        return $"{updatedAtUtc:yyyyMMddHHmmssfffffff}-{Guid.NewGuid():N}";
    }

    private sealed class TrendReportDataVersionEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = DataVersionPartitionKeyValue;
        public string RowKey { get; set; } = string.Empty;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
        public int UserId { get; set; }
        public string DataVersion { get; set; } = string.Empty;
        public DateTimeOffset UpdatedAtUtc { get; set; }
    }

    #endregion
}
