using System.Security.Cryptography;
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
    private const int CreateOrGetMaxAttempts = 5;
    private const int HttpNotFoundStatusCode = 404;
    private const int HttpConflictStatusCode = 409;
    private const int HttpPreconditionFailedStatusCode = 412;
    private const string DataVersionPartitionKeyValue = "trend-report-data-version";
    private const string DedupRowKeyPrefix = "job-dedup:";
    private const string JobPartitionKeyPrefix = "trend-report-user-";
    private readonly TableClient _tableClient;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);
    private readonly Lazy<Task> _ensureTableOnce;
    private readonly ILogger<TrendReportJobRepository> _logger;

    // Uses the AzureWebJobsStorage connection setting to access Azure Table Storage.
    public TrendReportJobRepository(IConfiguration configuration, ILogger<TrendReportJobRepository> logger)
    {
        var connectionString = configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var tableName = configuration["TrendReportTableName"] ?? "TrendReportJobs";
        _tableClient = new TableClient(connectionString, tableName);
        _ensureTableOnce = new Lazy<Task>(async () =>
        {
            await _tableClient.CreateIfNotExistsAsync();
        });
        _logger = logger;
    }

    internal TrendReportJobRepository(
        TableClient tableClient,
        ILogger<TrendReportJobRepository> logger)
    {
        _tableClient = tableClient;
        _ensureTableOnce = new Lazy<Task>(async () =>
        {
            await _tableClient.CreateIfNotExistsAsync();
        });
        _logger = logger;
    }

    #region: Create Async

    // Persists the initial job as an Azure Table entity.
    public async Task<TrendReportJob> CreateAsync(
        TrendReportJob job,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();
        await _tableClient.AddEntityAsync(ToEntity(job), cancellationToken);
        return job;
    }

    public async Task<CreateOrGetTrendReportJobResult> CreateOrGetByFingerprintAsync(
        TrendReportJob candidate,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        var partitionKey = GetJobPartitionKey(candidate.UserId);
        var dedupRowKey = GetDedupRowKey(candidate.DataVersion, candidate.ReportFingerprint);

        for (var attempt = 0; attempt < CreateOrGetMaxAttempts; attempt++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var dedup = await GetDedupEntityIfExistsAsync(partitionKey, dedupRowKey, cancellationToken);

            if (dedup is not null)
            {
                var result = await TryCreateOrGetFromDedupAsync(candidate, dedup, cancellationToken);

                if (result is not null)
                {
                    return result;
                }

                continue;
            }


            var createdJob = CreateNewJob(candidate, preserveCandidateRunId: true);
            var dedupPointer = ToDedupEntity(
                partitionKey,
                dedupRowKey,
                createdJob,
                createdJob.UpdatedAtUtc,
                createdJob.CreatedAtUtc);

            try
            {
                await _tableClient.SubmitTransactionAsync(
                    new[]
                    {
                        new TableTransactionAction(TableTransactionActionType.Add, dedupPointer),
                        new TableTransactionAction(TableTransactionActionType.Add, ToEntity(createdJob)),
                    },
                    cancellationToken);

                return new CreateOrGetTrendReportJobResult(createdJob, WasCreated: true);
            }
            catch (RequestFailedException exception) when (IsConcurrencyConflict(exception))
            {
                var winningDedup = await GetDedupEntityIfExistsAsync(partitionKey, dedupRowKey, cancellationToken);

                if (winningDedup is null)
                {
                    // Most likely a random numeric Job RowKey collision. Generate another JobId and retry.
                    continue;
                }

                // Another process won the race to create the dedup pointer. Try to create or get the job from the winning dedup pointer.
                var result = await TryCreateOrGetFromDedupAsync(candidate, winningDedup, cancellationToken);

                if (result is not null)
                {
                    return result;
                }
            }
            catch (RequestFailedException exception)
            {
                LogCreateOrGetFailure(exception, candidate, "AddDedupAndJobTransaction");
                throw;
            }
        }

        throw new InvalidOperationException(
            $"Unable to create or get trend report job for user {candidate.UserId} and fingerprint {candidate.ReportFingerprint} after {CreateOrGetMaxAttempts} attempts.");
    }

    #endregion

    #region: Data Version Management
    public async Task<string?> GetCurrentTrendReportReqDataVersionAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();
        var rowKey = userId.ToString();

        try
        {
            var response =
                await _tableClient.GetEntityAsync<TrendReportDataVersionEntity>(
                    DataVersionPartitionKeyValue,
                    rowKey,
                    cancellationToken: cancellationToken);

            return string.IsNullOrWhiteSpace(response.Value.DataVersion)
                ? null
                : response.Value.DataVersion;
        }
        catch (RequestFailedException ex) when (ex.Status == HttpNotFoundStatusCode)
        {
            return null;
        }
    }

    public async Task<string> BumpDataVersionAsync(
        int userId,
        DateTimeOffset updatedAtUtc,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        var nextVersion = CreateDataVersion(updatedAtUtc);
        await _tableClient.UpsertEntityAsync(new TrendReportDataVersionEntity
        {
            PartitionKey = DataVersionPartitionKeyValue,
            RowKey = userId.ToString(),
            UserId = userId,
            DataVersion = nextVersion,
            UpdatedAtUtc = updatedAtUtc,
        }, TableUpdateMode.Replace, cancellationToken);
        return nextVersion;
    }

    #endregion

    #region: Getters

    public async Task<TrendReportJob?> GetByIdAsync(
        int userId,
        int id,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<TrendReportJobEntity>(
                GetJobPartitionKey(userId),
                id.ToString(),
                cancellationToken: cancellationToken);
            return ToModel(response.Value);
        }
        catch (RequestFailedException exception) when (exception.Status == HttpNotFoundStatusCode)
        {
            return null;
        }
    }

    public async Task<TrendReportJob?> GetLatestByUserIdAndFingerprintAsync(int userId, string dataVersion,
        string reportFingerprint, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var jobs = await GetJobsByFingerprintAsync(userId, dataVersion, reportFingerprint, cancellationToken);

        return jobs
            .OrderByDescending(job => job.CreatedAtUtc)
            .FirstOrDefault();
    }

    public async Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        var jobs = new List<TrendReportJob>();
        var partitionKey = GetJobPartitionKey(userId);

        await foreach (var jobEntity in _tableClient.QueryAsync<TrendReportJobEntity>(
            entity => entity.PartitionKey == partitionKey && entity.UserId == userId,
            cancellationToken: cancellationToken))
        {
            if (IsDedupRowKey(jobEntity.RowKey))
            {
                continue;
            }

            if (IsActiveStatus(jobEntity.Status))
            {
                jobs.Add(ToModel(jobEntity));
            }
        }

        return jobs;
    }

    public async Task<IReadOnlyList<TrendReportJob>> GetUnstartedJobsForEnqueueRecoveryAsync(
        DateTimeOffset olderThanUtc,
        int maxCount,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        var jobs = new List<TrendReportJob>();

        await foreach (var jobEntity in _tableClient.QueryAsync<TrendReportJobEntity>(
            entity => entity.Status == TrendReportJobStatuses.EnqueuePending
                        && entity.StartedAtUtc == null
                        && entity.CreatedAtUtc <= olderThanUtc,
            maxPerPage: Math.Max(1, maxCount),
            cancellationToken: cancellationToken))
        {
            jobs.Add(ToModel(jobEntity));

            if (jobs.Count >= maxCount)
            {
                break;
            }
        }

        return jobs
            .OrderBy(job => job.CreatedAtUtc)
            .ToArray();
    }


    #endregion

    #region: Processing State Update Methods 
    public Task<bool> TryStartProcessingAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
                && entity.Status is TrendReportJobStatuses.EnqueuePending
                    or TrendReportJobStatuses.Queued
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

    public Task<bool> TryMarkQueuedIfEnqueuePendingAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
                && entity.Status == TrendReportJobStatuses.EnqueuePending
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Queued;
                entity.ProgressPercent = 0;
                entity.CurrentStage = "等待后台处理";
            },
            operationName: TrendReportRepositoryActions.MarkQueued,
            cancellationToken);
    }

    public async Task<TrendReportJob?> TryBeginEnqueueRecoveryAttemptAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        int maxAttempts,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityIfExistsAsync<TrendReportJobEntity>(
                partitionKey: GetJobPartitionKey(userId),
                rowKey: jobId.ToString(),
                cancellationToken: cancellationToken);

            if (!response.HasValue || response.Value is null)
            {
                throw new InvalidOperationException("Trend report job not found.");
            }

            var entity = response.Value;

            if (entity.DataVersion != expectedDataVersion
                || entity.RunId != expectedRunId
                || entity.Status != TrendReportJobStatuses.EnqueuePending
                || entity.ErrorMessage is not null)
            {
                throw new InvalidOperationException("Trend report job not found.");
            }

            var now = DateTimeOffset.UtcNow;
            var effectiveMaxAttempts = Math.Max(1, maxAttempts);

            if (entity.EnqueueRecoveryAttemptCount >= effectiveMaxAttempts)
            {
                MarkEnqueueRecoveryFailed(
                    entity,
                    now,
                    $"Trend report enqueue recovery retry limit exceeded after {entity.EnqueueRecoveryAttemptCount} attempts.");
            }
            else
            {
                entity.EnqueueRecoveryAttemptCount++;
                entity.LastEnqueueRecoveryAttemptAtUtc = now;
                entity.LastEnqueueRecoveryError = null;
                entity.UpdatedAtUtc = now;
            }

            await _tableClient.UpdateEntityAsync(
                entity,
                entity.ETag,
                TableUpdateMode.Merge,
                cancellationToken);

            return ToModel(entity);
        }
        catch (RequestFailedException exception) when (exception.Status == HttpNotFoundStatusCode)
        {
            throw new InvalidOperationException("Trend report job not found.");
        }
        catch (RequestFailedException exception) when (exception.Status == HttpPreconditionFailedStatusCode)
        {
            throw new InvalidOperationException("Trend report job not found.");
        }
        catch (RequestFailedException exception)
        {
            _logger.LogError(
                exception,
                "Failed to begin trend report enqueue recovery attempt. JobId={JobId}, ExpectedRunId={ExpectedRunId}, ExpectedDataVersion={ExpectedDataVersion}.",
                jobId,
                expectedRunId,
                expectedDataVersion);

            throw;
        }
    }

    public Task<bool> TryRecordEnqueueRecoveryFailureAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        string errorMessage,
        int maxAttempts,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
                && entity.Status == TrendReportJobStatuses.EnqueuePending,
            (entity, now) =>
            {
                entity.LastEnqueueRecoveryError = errorMessage;

                if (entity.EnqueueRecoveryAttemptCount >= Math.Max(1, maxAttempts))
                {
                    MarkEnqueueRecoveryFailed(entity, now, errorMessage);
                }
            },
            operationName: TrendReportRepositoryActions.RecordEnqueueRecoveryFailure,
            cancellationToken);
    }

    public Task<bool> TryUpdateProgressIfCurrentProcessingAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        int progressPercent,
        string currentStage,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
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
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
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
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
                && entity.Status == TrendReportJobStatuses.Processing
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Failed;
                entity.ErrorMessage = "训练报告生成失败，请稍后重试或联系管理员。";
                entity.CompletedAtUtc = now;
                entity.CurrentStage = "Report generation failed";
            },
            operationName: TrendReportRepositoryActions.MarkFailed,
            cancellationToken);
    }

    public Task<bool> TryMarkSupersededIfCurrentAsync(
        int userId,
        string runId,
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            null,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                    && entity.RunId == runId.ToString()
                    && IsActiveStatus(entity.Status),
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Superseded;
                entity.CurrentStage = "已跳过：队列消息的数据版本已过期";
                entity.CompletedAtUtc = now;
            },
            operationName: TrendReportRepositoryActions.MarkSuperseded,
            cancellationToken);
    }

    public Task<bool> TryMarkSupersededIfCancelRequestedAsync(
        int userId,
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            null,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.Status == TrendReportJobStatuses.CancelRequested,
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
        int userId,
        int jobId,
        string? expectedRunId,
        string expectedDataVersion,
        Func<TrendReportJobEntity, bool> canUpdate,
        Action<TrendReportJobEntity, DateTimeOffset> applyUpdate,
        TrendReportRepositoryActions operationName,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityIfExistsAsync<TrendReportJobEntity>(
                partitionKey: GetJobPartitionKey(userId),
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
        catch (RequestFailedException exception) when (exception.Status == HttpNotFoundStatusCode
            || exception.Status == HttpPreconditionFailedStatusCode)
        {
            return false;
        }
        catch (RequestFailedException exception)
        {
            _logger.LogError(
                exception,
                "Failed to update trend report job. Operation={Operation}, JobId={JobId}, ExpectedRunId={ExpectedRunId}, ExpectedDataVersion={ExpectedDataVersion}.",
                operationName,
                jobId,
                expectedRunId,
                expectedDataVersion);

            throw;
        }
    }

    #endregion

    #region: Update Async   
    // Replaces the current job entity in Azure Table Storage.
    public async Task<TrendReportJob> UpdateAsync(
        TrendReportJob job,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();
        var partitionKey = GetJobPartitionKey(job.UserId);

        try
        {
            var current = await _tableClient.GetEntityIfExistsAsync<TrendReportJobEntity>(
                partitionKey,
                job.Id.ToString(),
                cancellationToken: cancellationToken);

            if (!current.HasValue || current.Value is null)
            {
                throw CreateMissingJobException(job.UserId, job.Id);
            }

            if (!BlocksStaleWorkerOverwrite(job.Status)
                && BlocksStaleWorkerOverwrite(current.Value.Status))
            {
                return ToModel(current.Value);
            }

            var entity = ToEntity(job);

            await _tableClient.UpdateEntityAsync(
                entity,
                current.Value.ETag,
                TableUpdateMode.Replace,
                cancellationToken);

            return job;
        }
        catch (RequestFailedException exception) when (exception.Status == HttpNotFoundStatusCode)
        {
            throw CreateMissingJobException(job.UserId, job.Id, exception);
        }
        catch (RequestFailedException exception) when (exception.Status == HttpPreconditionFailedStatusCode)
        {
            var latest = await GetByIdAsync(job.UserId, job.Id, cancellationToken);

            if (latest is not null)
            {
                return latest;
            }

            throw CreateMissingJobException(job.UserId, job.Id, exception);
        }
        catch (RequestFailedException exception)
        {
            _logger.LogError(
                exception,
                "Failed to replace trend report job. JobId={JobId}, UserId={UserId}, Status={Status}.",
                job.Id,
                job.UserId,
                job.Status);

            throw;
        }
    }

    #endregion

    #region: Private Helper Methods

    private Task EnsureTableAsync()
    {
        return _ensureTableOnce.Value;
    }

    private async Task<CreateOrGetTrendReportJobResult?> TryCreateOrGetFromDedupAsync(
        TrendReportJob candidate,
        TrendReportJobDedupEntity dedup,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (dedup.UserId != candidate.UserId
            || dedup.DataVersion != candidate.DataVersion
            || dedup.ReportFingerprint != candidate.ReportFingerprint)
        {
            throw new InvalidOperationException(
                $"Trend report dedup pointer {dedup.RowKey} is corrupt for user {candidate.UserId}.");
        }

        var existingJob = await GetByIdAsync(dedup.UserId, dedup.JobId, cancellationToken);

        if (existingJob is null)
        {
            throw new InvalidOperationException(
                $"Trend report dedup pointer {dedup.RowKey} references missing job {dedup.JobId} for user {dedup.UserId}.");
        }

        if (IsReusableDedupJobStatus(existingJob.Status))
        {
            return new CreateOrGetTrendReportJobResult(existingJob, WasCreated: false);
        }

        var replacementJob = CreateNewJob(candidate, preserveCandidateRunId: false);
        var updatedDedup = ToDedupEntity(
            dedup.PartitionKey,
            dedup.RowKey,
            replacementJob,
            replacementJob.UpdatedAtUtc,
            dedup.CreatedAtUtc);

        try
        {
            await _tableClient.SubmitTransactionAsync(
                new[]
                {
                    new TableTransactionAction(TableTransactionActionType.UpdateMerge, updatedDedup, dedup.ETag),
                    new TableTransactionAction(TableTransactionActionType.Add, ToEntity(replacementJob)),
                },
                cancellationToken);

            return new CreateOrGetTrendReportJobResult(replacementJob, WasCreated: true);
        }
        catch (RequestFailedException exception) when (IsConcurrencyConflict(exception))
        {
            return null;
        }
        catch (RequestFailedException exception)
        {
            LogCreateOrGetFailure(exception, candidate, "ReplaceTerminalDedupPointerTransaction");
            throw;
        }
    }

    private async Task<TrendReportJobDedupEntity?> GetDedupEntityIfExistsAsync(
        string partitionKey,
        string rowKey,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _tableClient.GetEntityIfExistsAsync<TrendReportJobDedupEntity>(
                partitionKey,
                rowKey,
                cancellationToken: cancellationToken);

            return response.HasValue ? response.Value : null;
        }
        catch (RequestFailedException exception)
        {
            _logger.LogError(
                exception,
                "Failed to read trend report dedup pointer. PartitionKey={PartitionKey}, RowKey={RowKey}.",
                partitionKey,
                rowKey);

            throw;
        }
    }

    private async Task<IReadOnlyList<TrendReportJob>> GetJobsByFingerprintAsync(
        int userId,
        string dataVersion,
        string reportFingerprint,
        CancellationToken cancellationToken)
    {
        await EnsureTableAsync();

        var jobs = new List<TrendReportJob>();
        var partitionKey = GetJobPartitionKey(userId);

        await foreach (var jobEntity in _tableClient.QueryAsync<TrendReportJobEntity>(
            entity => entity.PartitionKey == partitionKey
                && entity.UserId == userId
                && entity.DataVersion == dataVersion
                && entity.ReportFingerprint == reportFingerprint,
            cancellationToken: cancellationToken))
        {
            if (IsDedupRowKey(jobEntity.RowKey))
            {
                continue;
            }

            jobs.Add(ToModel(jobEntity));
        }

        return jobs;
    }

    private static string GetJobPartitionKey(int userId)
    {
        return $"{JobPartitionKeyPrefix}{userId}";
    }

    private static string GetDedupRowKey(string dataVersion, string reportFingerprint)
    {
        var rowKey = $"{DedupRowKeyPrefix}{dataVersion}:{reportFingerprint}";
        ValidateTableKey(rowKey, "Trend report dedup RowKey");
        return rowKey;
    }

    private static bool IsDedupRowKey(string rowKey)
    {
        return rowKey.StartsWith(DedupRowKeyPrefix, StringComparison.Ordinal);
    }

    private static void ValidateTableKey(string key, string name)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new ArgumentException($"{name} must not be empty.", nameof(key));
        }

        if (key.Any(IsInvalidTableKeyCharacter))
        {
            throw new ArgumentException($"{name} contains an invalid Azure Table key character.", nameof(key));
        }
    }

    private static bool IsInvalidTableKeyCharacter(char character)
    {
        return character is '/' or '\\' or '#' or '?'
            || char.IsControl(character);
    }

    private static bool IsConcurrencyConflict(RequestFailedException exception)
    {
        return exception.Status is HttpConflictStatusCode
            or HttpPreconditionFailedStatusCode;
    }

    private static bool IsActiveStatus(string status)
    {
        return status is TrendReportJobStatuses.Queued
            or TrendReportJobStatuses.EnqueuePending
            or TrendReportJobStatuses.Processing;
    }

    private static bool IsTerminalStatus(string status)
    {
        return status is TrendReportJobStatuses.Completed
            or TrendReportJobStatuses.Failed
            or TrendReportJobStatuses.Cancelled
            or TrendReportJobStatuses.Superseded
            or TrendReportJobStatuses.CancelRequested;
    }

    private static bool IsReusableDedupJobStatus(string status)
    {
        return status is not TrendReportJobStatuses.Failed
            and not TrendReportJobStatuses.Cancelled
            and not TrendReportJobStatuses.Superseded;
    }

    private static void MarkEnqueueRecoveryFailed(
        TrendReportJobEntity entity,
        DateTimeOffset now,
        string errorMessage)
    {
        entity.Status = TrendReportJobStatuses.Failed;
        entity.CurrentStage = "报告任务提交后台队列失败";
        entity.ErrorMessage = errorMessage;
        entity.CompletedAtUtc = now;
        entity.UpdatedAtUtc = now;
        entity.LastEnqueueRecoveryError = errorMessage;
    }

    private static bool BlocksStaleWorkerOverwrite(string status)
    {
        return status is TrendReportJobStatuses.Cancelled
            or TrendReportJobStatuses.Superseded
            or TrendReportJobStatuses.CancelRequested;
    }

    private static InvalidOperationException CreateMissingJobException(
        int userId,
        int jobId,
        Exception? innerException = null)
    {
        return new InvalidOperationException(
            $"Trend report job {jobId} for user {userId} no longer exists.",
            innerException);
    }

    private static TrendReportJob CreateNewJob(
        TrendReportJob candidate,
        bool preserveCandidateRunId)
    {
        var now = DateTimeOffset.UtcNow;
        var runId = preserveCandidateRunId && !string.IsNullOrWhiteSpace(candidate.RunId)
            ? candidate.RunId
            : CreateRunId();

        return candidate with
        {
            Id = RandomNumberGenerator.GetInt32(1, int.MaxValue),
            Status = TrendReportJobStatuses.EnqueuePending,
            ProgressPercent = 0,
            RunId = runId,
            Result = null,
            ErrorMessage = null,
            StartedAtUtc = null,
            CompletedAtUtc = null,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };
    }

    private static string CreateRunId()
    {
        return $"trend-report:{Guid.NewGuid():N}";
    }

    private static TrendReportJobDedupEntity ToDedupEntity(
        string partitionKey,
        string rowKey,
        TrendReportJob job,
        DateTimeOffset updatedAtUtc,
        DateTimeOffset createdAtUtc)
    {
        return new TrendReportJobDedupEntity
        {
            PartitionKey = partitionKey,
            RowKey = rowKey,
            UserId = job.UserId,
            JobId = job.Id,
            RunId = job.RunId,
            DataVersion = job.DataVersion,
            ReportFingerprint = job.ReportFingerprint,
            CreatedAtUtc = createdAtUtc,
            UpdatedAtUtc = updatedAtUtc,
        };
    }

    private void LogCreateOrGetFailure(
        RequestFailedException exception,
        TrendReportJob candidate,
        string operationName)
    {
        _logger.LogError(
            exception,
            "Failed to create or get trend report job. Operation={Operation}, UserId={UserId}, DataVersion={DataVersion}, ReportFingerprint={ReportFingerprint}.",
            operationName,
            candidate.UserId,
            candidate.DataVersion,
            candidate.ReportFingerprint);
    }

    private TrendReportJobEntity ToEntity(TrendReportJob job)
    {
        return new TrendReportJobEntity
        {
            PartitionKey = GetJobPartitionKey(job.UserId),
            RowKey = job.Id.ToString(),
            Status = job.Status,
            UserId = job.UserId,
            ProgressPercent = job.ProgressPercent,
            CurrentStage = job.CurrentStage,
            RunId = job.RunId,
            DataVersion = job.DataVersion,
            ReportFingerprint = job.ReportFingerprint,
            RequestJson = JsonSerializer.Serialize(job.Request, _jsonOptions),
            SnapshotJson = JsonSerializer.Serialize(job.Snapshot, _jsonOptions),
            ResultJson = job.Result is null
                ? null
                : JsonSerializer.Serialize(job.Result, _jsonOptions),
            ErrorMessage = job.ErrorMessage,
            EnqueueRecoveryAttemptCount = 0,
            LastEnqueueRecoveryAttemptAtUtc = null,
            LastEnqueueRecoveryError = null,
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
            entity.RunId,
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
