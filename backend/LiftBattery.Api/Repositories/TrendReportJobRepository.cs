using System.Globalization;
using System.Security.Cryptography;
using System.Text;
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
    private const int HttpNotFoundStatusCode = 404;
    private const int HttpConflictStatusCode = 409;
    private const int HttpPreconditionFailedStatusCode = 412;
    private const string DataVersionPartitionKeyValue = "trend-report-data-version";
    private const string ActiveJobRowKeyValue = "active-job";
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

    public async Task<CreateOrGetTrendReportJobResult> CreateOrGetAsync(
        NewTrendReportJob newJobCandidate,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await EnsureTableAsync();

        var createState = await LoadCreateStateAsync(
            newJobCandidate,
            cancellationToken);
        var existingResult = EvaluateCreateState(createState);

        if (existingResult is not null)
        {
            return existingResult;
        }

        var createdJob = CreateNewJob(newJobCandidate);
        return await PersistNewJobAsync(
            newJobCandidate,
            createdJob,
            createState,
            cancellationToken);
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
        Guid id,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<TrendReportJobEntity>(
                GetJobPartitionKey(userId),
                GetJobRowKey(id),
                cancellationToken: cancellationToken);
            return ToModel(response.Value);
        }
        catch (RequestFailedException exception) when (exception.Status == HttpNotFoundStatusCode)
        {
            return null;
        }
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

    public Task<bool> TryMarkCancelledIfActiveAsync(
        int userId,
        Guid jobId,
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
                entity.RunId == expectedRunId
                && entity.DataVersion == expectedDataVersion
                && IsActiveStatus(entity.Status),
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Cancelled;
                entity.CurrentStage = "Report generation cancelled";
                entity.ErrorMessage = null;
                entity.CompletedAtUtc = now;
            },
            operationName: TrendReportRepositoryActions.MarkCancelled,
            cancellationToken);
    }

    public Task<bool> TryRecordInitialEnqueueFailureAsync(
        int userId,
        Guid jobId,
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
                entity.RunId == expectedRunId
                && entity.DataVersion == expectedDataVersion
                && entity.Status == TrendReportJobStatuses.EnqueuePending,
            (entity, _) =>
            {
                entity.CurrentStage = "提交后台队列失败，等待自动重试。";
                entity.ErrorMessage = null;
            },
            operationName: TrendReportRepositoryActions.RecordInitialEnqueueFailure,
            cancellationToken);
    }

    public Task<bool> TryStartProcessingAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        // Starting is best-effort. A redelivery that already sees Processing does not
        // need to rewrite the row; it can safely recompute the immutable snapshot and
        // compete only on the terminal ETag-protected update.
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
                && (entity.Status is TrendReportJobStatuses.EnqueuePending
                    or TrendReportJobStatuses.Queued)
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.Status = TrendReportJobStatuses.Processing;
                entity.ProgressPercent = 15;
                entity.CurrentStage = "正在读取报告配置";
                entity.StartedAtUtc ??= now;
            },
            operationName: TrendReportRepositoryActions.StartProcessing,
            cancellationToken);
    }

    public Task<bool> TryMarkQueuedIfEnqueuePendingAsync(
        int userId,
        Guid jobId,
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
        Guid jobId,
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
                rowKey: GetJobRowKey(jobId),
                cancellationToken: cancellationToken);

            if (!response.HasValue || response.Value is null)
            {
                return null;
            }

            var entity = response.Value;

            // The recovery scan is stale as soon as it completes. Losing eligibility
            // is an expected race, not a repository failure.
            if (entity.DataVersion != expectedDataVersion
                || entity.RunId != expectedRunId
                || entity.Status != TrendReportJobStatuses.EnqueuePending
                || entity.ErrorMessage is not null)
            {
                return null;
            }

            var now = DateTimeOffset.UtcNow;
            var effectiveMaxAttempts = Math.Max(1, maxAttempts);
            var canEnqueue = entity.EnqueueRecoveryAttemptCount < effectiveMaxAttempts;

            if (!canEnqueue)
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

            // ETag conditionally claims this recovery attempt. A competing timer that
            // read the same pending row will receive 412 and return null below.
            await UpdateJobAndReleaseActiveLeaseIfTerminalAsync(
                entity,
                cancellationToken);

            return canEnqueue ? ToModel(entity) : null;
        }
        catch (RequestFailedException exception) when (exception.Status == HttpNotFoundStatusCode
            || exception.Status == HttpPreconditionFailedStatusCode)
        {
            return null;
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
        Guid jobId,
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

    public Task<bool> TryCompleteIfCurrentActiveAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default)
    {
        // At-least-once delivery may compute the same immutable snapshot more than once.
        // Any still-active copy may attempt completion; ETag and the terminal status
        // transition ensure that only the first terminal writer wins.
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
                && IsActiveStatus(entity.Status)
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

    public Task<bool> TryMarkFailedOnFinalDeliveryAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        // The final delivery may fail any still-active copy. A concurrent completion,
        // cancellation, or supersession wins through the same ETag/status conditions.
        return TryUpdateEntityAsync(
            userId,
            jobId,
            expectedRunId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                && entity.RunId == expectedRunId
                && IsActiveStatus(entity.Status)
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
        Guid jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            runId,
            expectedDataVersion,
            entity =>
                entity.DataVersion == expectedDataVersion
                    && entity.RunId == runId
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

    private async Task<bool> TryUpdateEntityAsync(
        int userId,
        Guid jobId,
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
                rowKey: GetJobRowKey(jobId),
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

            await UpdateJobAndReleaseActiveLeaseIfTerminalAsync(
                entity,
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

    private async Task UpdateJobAndReleaseActiveLeaseIfTerminalAsync(
        TrendReportJobEntity entity,
        CancellationToken cancellationToken)
    {
        if (!IsTerminalStatus(entity.Status))
        {
            await _tableClient.UpdateEntityAsync(
                entity,
                entity.ETag,
                TableUpdateMode.Merge,
                cancellationToken);
            return;
        }

        var activeJob = await GetActiveJobLeaseIfExistsAsync(
            entity.PartitionKey,
            cancellationToken);
        var jobId = Guid.ParseExact(entity.RowKey, "N");

        if (activeJob is null
            || activeJob.JobId != jobId
            || activeJob.RunId != entity.RunId)
        {
            await _tableClient.UpdateEntityAsync(
                entity,
                entity.ETag,
                TableUpdateMode.Merge,
                cancellationToken);
            return;
        }

        // The status transition and lease release share one Azure Table partition,
        // so another Generate cannot observe a terminal job that still owns the lease.
        await _tableClient.SubmitTransactionAsync(
            [
                new TableTransactionAction(
                    TableTransactionActionType.UpdateMerge,
                    entity,
                    entity.ETag),
                new TableTransactionAction(
                    TableTransactionActionType.Delete,
                    activeJob,
                    activeJob.ETag),
            ],
            cancellationToken);
    }

    #endregion

    #region: Private Helper Methods

    private Task EnsureTableAsync()
    {
        return _ensureTableOnce.Value;
    }

    private async Task<CreateJobState> LoadCreateStateAsync(
        NewTrendReportJob newJobCandidate,
        CancellationToken cancellationToken)
    {
        var partitionKey = GetJobPartitionKey(newJobCandidate.UserId);
        var dedupRowKey = GetDedupRowKey(newJobCandidate);

        // Step 1: Read the user-wide lease first. This gives every later read an
        // unambiguous meaning and avoids trying to assemble a cross-row snapshot by
        // repeatedly reading Dedup, Job, and ActiveLease.
        var activeJobLease = await GetActiveJobLeaseIfExistsAsync(
            partitionKey,
            cancellationToken);

        if (activeJobLease is not null)
        {
            var leasedJob = await GetJobOwnedByActiveLeaseAsync(
                newJobCandidate.UserId,
                activeJobLease,
                cancellationToken);

            if (IsActiveStatus(leasedJob.Status))
            {
                // The leased Job is authoritative while it is active:
                // - same DataVersion and parameters: an identical request already owns
                //   the slot, so EvaluateCreateState returns that Job;
                // - different DataVersion or parameters: another request owns the slot,
                //   so EvaluateCreateState returns the product-level 409 conflict.
                return new CreateJobState(
                    partitionKey,
                    dedupRowKey,
                    Dedup: null,
                    ExistingCurrentReqJob: JobMatchesRequest(
                        newJobCandidate,
                        leasedJob)
                        ? leasedJob
                        : null,
                    activeJobLease);
            }

            if (!IsTerminalStatus(leasedJob.Status))
            {
                // A lease may only point to a known active Job or to a terminal Job
                // observed across an atomic terminal transition. Do not guess how an
                // unknown persisted status participates in the single-active rule.
                throw new InvalidOperationException(
                    $"Trend report active-job lease references job {leasedJob.Id} with unsupported status '{leasedJob.Status}'.");
            }

            // The worker terminally updated the Job and deleted its lease atomically
            // after our lease read but before our Job read. Continue exactly as if no
            // active lease had been observed. A truly orphaned lease will still make
            // the later create transaction fail on the fixed active-job RowKey.
        }
        // Step 2: No usable active lease was observed. Read this request's dedup once.
        // If another identical request commits after the lease read, this read can see
        // its active Job; that is a normal concurrent winner, not a missing-lease bug.
        var dedup = await GetDedupEntityIfExistsAsync(
            partitionKey,
            dedupRowKey,
            cancellationToken);
        var existingCurrentReqJob = dedup is null
            ? null
            : await GetMatchingJobFromDedupAsync(
                newJobCandidate,
                dedup,
                cancellationToken);

        return new CreateJobState(
            partitionKey,
            dedupRowKey,
            dedup,
            existingCurrentReqJob,
            ActiveJobLease: null);
    }

    private static CreateOrGetTrendReportJobResult? EvaluateCreateState(
        CreateJobState createState)
    {
        var activeJobLease = createState.ActiveJobLease;

        if (activeJobLease is not null)
        {
            // LoadCreateStateAsync resolved the Job referenced by this authoritative
            // lease. A matching request returns it; a different request receives 409.
            var existingCurrentReqJob = createState.ExistingCurrentReqJob;

            if (existingCurrentReqJob is not null
                && ActiveJobLeaseMatchesExistingCurrentReqJob(
                    activeJobLease,
                    existingCurrentReqJob))
            {
                return new CreateOrGetTrendReportJobResult(
                    existingCurrentReqJob,
                    WasCreated: false);
            }

            // A different request owns the active slot. The API logs its JobId for
            // diagnosis but does not expose that internal identifier to the user.
            throw new TrendReportActiveJobExistsException(
                activeJobLease.JobId);
        }
        else
        {
            var existingCurrentReqJobWithoutLease = createState.ExistingCurrentReqJob;

            if (existingCurrentReqJobWithoutLease is null)
            {
                // No active lease and no dedup job: this request may try the atomic create.
                return null;
            }

            if (existingCurrentReqJobWithoutLease.Status == TrendReportJobStatuses.Completed)
            {
                // Completed results are immutable and reusable after their lease is released.
                return new CreateOrGetTrendReportJobResult(
                    existingCurrentReqJobWithoutLease,
                    WasCreated: false);
            }

            if (IsActiveStatus(existingCurrentReqJobWithoutLease.Status))
            {
                // The lease was read before this request's dedup. An identical request may
                // therefore have atomically created Dedup + Job + ActiveLease between those
                // reads. Return that winning Job; the earlier null lease observation is stale.
                return new CreateOrGetTrendReportJobResult(
                    existingCurrentReqJobWithoutLease,
                    WasCreated: false);
            }

            if (IsTerminalStatus(existingCurrentReqJobWithoutLease.Status))
            {
                // Failed, Cancelled, and Superseded are not reused. This explicit Generate
                // request may try to atomically repoint the dedup row to a new Job.
                return null;
            }

            // Refuse to guess how an unknown persisted status should participate in
            // deduplication. The internal details are logged and never shown to the user.
            throw new InvalidOperationException(
                $"Trend report job {existingCurrentReqJobWithoutLease.Id} has unsupported status '{existingCurrentReqJobWithoutLease.Status}'.");
        }
    }

    private async Task<TrendReportJob> GetJobOwnedByActiveLeaseAsync(
        int userId,
        TrendReportActiveJobEntity activeJobLease,
        CancellationToken cancellationToken)
    {
        var leasedJob = await GetByIdAsync(
            userId,
            activeJobLease.JobId,
            cancellationToken);

        if (leasedJob is null)
        {
            // The fixed lease must never outlive or point past its job row. Treat a
            // dangling lease as storage corruption instead of blocking on an unknown job.
            throw new InvalidOperationException(
                $"Trend report active-job lease references missing job {activeJobLease.JobId} for user {userId}.");
        }

        if (leasedJob.RunId != activeJobLease.RunId)
        {
            // JobId and RunId together identify the exact execution. A mismatch means
            // the lease is stale or was associated with a different execution.
            throw new InvalidOperationException(
                $"Trend report active-job lease has RunId {activeJobLease.RunId}, but job {leasedJob.Id} has RunId {leasedJob.RunId}.");
        }

        return leasedJob;
    }

    private static bool JobMatchesRequest(
        NewTrendReportJob newJobCandidate,
        TrendReportJob job)
    {
        return job.DataVersion == newJobCandidate.DataVersion
            && job.Request == newJobCandidate.Request;
    }

    private static bool ActiveJobLeaseMatchesExistingCurrentReqJob(
        TrendReportActiveJobEntity activeJobLease,
        TrendReportJob existingCurrentReqJob)
    {
        return activeJobLease.JobId == existingCurrentReqJob.Id
            && activeJobLease.RunId == existingCurrentReqJob.RunId;
    }

    private async Task<CreateOrGetTrendReportJobResult> PersistNewJobAsync(
        NewTrendReportJob newJobCandidate,
        TrendReportJob createdJob,
        CreateJobState createState,
        CancellationToken cancellationToken)
    {
        var transactionActions = BuildCreateTransactionActions(
            createdJob,
            createState);

        try
        {
            await _tableClient.SubmitTransactionAsync(
                transactionActions,
                cancellationToken);

            return new CreateOrGetTrendReportJobResult(
                createdJob,
                WasCreated: true);
        }
        catch (RequestFailedException exception) when (IsConcurrencyConflict(exception))
        {
            // A 409/412 can mean either that an identical-parameter tab won this
            // request's dedup row or that a different-parameter tab won the user-wide
            // active lease. Reloading the committed state distinguishes those outcomes.
            return await HandleCreateConflictAsync(
                newJobCandidate,
                exception,
                cancellationToken);
        }
        catch (RequestFailedException exception)
        {
            // Non-concurrency Azure Table failures are infrastructure errors. Record
            // request identifiers in logs and let the API return its generic safe error.
            LogCreateOrGetFailure(
                exception,
                newJobCandidate,
                "CreateOrGetTransaction");
            throw;
        }
    }

    private IReadOnlyList<TableTransactionAction> BuildCreateTransactionActions(
        TrendReportJob createdJob,
        CreateJobState createState)
    {
        var now = DateTimeOffset.UtcNow;
        var actions = new List<TableTransactionAction>();

        if (createState.Dedup is null)
        {
            actions.Add(new TableTransactionAction(
                TableTransactionActionType.Add,
                ToDedupEntity(
                    createState.PartitionKey,
                    createState.DedupRowKey,
                    createdJob.Id,
                    createdJob.UpdatedAtUtc,
                    createdJob.CreatedAtUtc)));
        }
        else
        {
            // An explicit Generate after Failed, Cancelled, or Superseded starts a new job.
            // Completed remains immutable and is returned before this transaction is built.
            createState.Dedup.JobId = createdJob.Id;
            createState.Dedup.UpdatedAtUtc = now;
            actions.Add(new TableTransactionAction(
                TableTransactionActionType.UpdateMerge,
                createState.Dedup,
                createState.Dedup.ETag));
        }

        actions.Add(new TableTransactionAction(
            TableTransactionActionType.Add,
            ToEntity(createdJob)));
        actions.Add(new TableTransactionAction(
            TableTransactionActionType.Add,
            ToActiveJobLease(
                createState.PartitionKey,
                createdJob,
                now)));

        return actions;
    }

    private async Task<TrendReportJob> GetMatchingJobFromDedupAsync(
        NewTrendReportJob newJobCandidate,
        TrendReportJobDedupEntity dedup,
        CancellationToken cancellationToken)
    {
        var job = await GetByIdAsync(
            newJobCandidate.UserId,
            dedup.JobId,
            cancellationToken);

        if (job is null)
        {
            // A dedup pointer and its job are written atomically. A pointer to a missing
            // job is a broken idempotency record, not a normal no-result condition.
            throw new InvalidOperationException(
                $"Trend report dedup pointer {dedup.RowKey} references missing job {dedup.JobId} for user {newJobCandidate.UserId}.");
        }

        if (!JobMatchesRequest(newJobCandidate, job))
        {
            // The hashed row key must still resolve to the exact request. This catches
            // either a hash collision or a corrupted pointer before another tab's job
            // can be returned for the current parameters.
            throw new InvalidOperationException(
                $"Trend report dedup pointer {dedup.RowKey} references a non-matching job {job.Id}.");
        }

        return job;
    }

    private async Task<CreateOrGetTrendReportJobResult> HandleCreateConflictAsync(
        NewTrendReportJob newJobCandidate,
        RequestFailedException createException,
        CancellationToken cancellationToken)
    {
        // Azure Table transactions are atomic, so this failed transaction changed no
        // rows. Reload the winner: an identical-parameter tab returns its job, while a
        // different-parameter tab is converted to TrendReportActiveJobExistsException
        // by the shared evaluation rules. The winner may also have completed and
        // released its active lease before this read, in which case its dedup still
        // identifies the completed job.
        var latestState = await LoadCreateStateAsync(
            newJobCandidate,
            cancellationToken);
        var winningResult = EvaluateCreateState(latestState);

        if (winningResult is not null)
        {
            return winningResult;
        }

        // A concurrency response was observed, but the committed state now contains
        // neither a reusable result for this request nor an active request to report.
        // Do not start an implicit replacement/retry; preserve single-submit semantics
        // and expose only a generic service error while retaining details in the logs.
        throw new InvalidOperationException(
            $"A concurrent trend report create transaction could not be resolved for user {newJobCandidate.UserId}.",
            createException);
    }

    private async Task<TrendReportActiveJobEntity?> GetActiveJobLeaseIfExistsAsync(
        string partitionKey,
        CancellationToken cancellationToken)
    {
        var response = await _tableClient.GetEntityIfExistsAsync<TrendReportActiveJobEntity>(
            partitionKey,
            ActiveJobRowKeyValue,
            cancellationToken: cancellationToken);

        return response.HasValue ? response.Value : null;
    }

    private async Task<TrendReportJobEntity?> GetJobEntityIfExistsAsync(
        string partitionKey,
        Guid jobId,
        CancellationToken cancellationToken)
    {
        var response = await _tableClient.GetEntityIfExistsAsync<TrendReportJobEntity>(
            partitionKey,
            GetJobRowKey(jobId),
            cancellationToken: cancellationToken);

        return response.HasValue ? response.Value : null;
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

    private static string GetJobPartitionKey(int userId)
    {
        return $"{JobPartitionKeyPrefix}{userId}";
    }

    private static string GetJobRowKey(Guid jobId)
    {
        return jobId.ToString("N");
    }

    private static string GetDedupRowKey(NewTrendReportJob newJob)
    {
        var request = newJob.Request;
        var dedupSource = string.Join(
            "\n",
            newJob.DataVersion,
            request.StartWeek.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            request.EndWeek.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            request.ComparisonStartWeek?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? string.Empty,
            request.ComparisonEndWeek?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) ?? string.Empty);
        var dedupHash = Convert.ToHexString(
                SHA256.HashData(Encoding.UTF8.GetBytes(dedupSource)))
            .ToLowerInvariant();
        var rowKey = $"{DedupRowKeyPrefix}{dedupHash}";
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
            or TrendReportJobStatuses.Superseded;
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

    private static TrendReportJob CreateNewJob(NewTrendReportJob newJob)
    {
        var now = DateTimeOffset.UtcNow;
        var runId = !string.IsNullOrWhiteSpace(newJob.RunId)
            ? newJob.RunId
            : CreateRunId();

        return new TrendReportJob(
            Id: Guid.NewGuid(),
            UserId: newJob.UserId,
            Status: TrendReportJobStatuses.EnqueuePending,
            ProgressPercent: 0,
            CurrentStage: newJob.CurrentStage,
            Request: newJob.Request,
            RunId: runId,
            DataVersion: newJob.DataVersion,
            Snapshot: newJob.Snapshot,
            Result: null,
            ErrorMessage: null,
            CreatedAtUtc: now,
            StartedAtUtc: null,
            CompletedAtUtc: null,
            UpdatedAtUtc: now);
    }

    private static string CreateRunId()
    {
        return $"trend-report:{Guid.NewGuid():N}";
    }

    private static TrendReportJobDedupEntity ToDedupEntity(
        string partitionKey,
        string rowKey,
        Guid jobId,
        DateTimeOffset updatedAtUtc,
        DateTimeOffset createdAtUtc)
    {
        return new TrendReportJobDedupEntity
        {
            PartitionKey = partitionKey,
            RowKey = rowKey,
            JobId = jobId,
            CreatedAtUtc = createdAtUtc,
            UpdatedAtUtc = updatedAtUtc,
        };
    }

    private static TrendReportActiveJobEntity ToActiveJobLease(
        string partitionKey,
        TrendReportJob job,
        DateTimeOffset updatedAtUtc)
    {
        return new TrendReportActiveJobEntity
        {
            PartitionKey = partitionKey,
            RowKey = ActiveJobRowKeyValue,
            JobId = job.Id,
            RunId = job.RunId,
            UpdatedAtUtc = updatedAtUtc,
        };
    }

    private void LogCreateOrGetFailure(
        RequestFailedException exception,
        NewTrendReportJob newJob,
        string operationName)
    {
        _logger.LogError(
            exception,
            "Failed to create or get trend report job. Operation={Operation}, UserId={UserId}, DataVersion={DataVersion}.",
            operationName,
            newJob.UserId,
            newJob.DataVersion);
    }

    private TrendReportJobEntity ToEntity(TrendReportJob job)
    {
        return new TrendReportJobEntity
        {
            PartitionKey = GetJobPartitionKey(job.UserId),
            RowKey = GetJobRowKey(job.Id),
            Status = job.Status,
            UserId = job.UserId,
            ProgressPercent = job.ProgressPercent,
            CurrentStage = job.CurrentStage,
            RunId = job.RunId,
            DataVersion = job.DataVersion,
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
            Guid.ParseExact(entity.RowKey, "N"),
            entity.UserId,
            entity.Status,
            entity.ProgressPercent,
            entity.CurrentStage,
            request,
            entity.RunId,
            entity.DataVersion,
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

    private sealed record CreateJobState(
        string PartitionKey,
        string DedupRowKey,
        TrendReportJobDedupEntity? Dedup,
        TrendReportJob? ExistingCurrentReqJob,
        TrendReportActiveJobEntity? ActiveJobLease);

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
