# Trend report Service Bus setup

The trend report flow requires:

- An Azure Service Bus queue named `trend-report-jobs`.
- `ServiceBusConnection` set to a Service Bus connection string with send and listen access.
- `AzureWebJobsStorage` pointing to Azure Storage or Azurite with Table support enabled.

`TrendReportJobs` is created automatically in Table Storage. The same table also stores one `trend-report-data-version` row per user. The queue must be created before the Function App starts. Keep the queue's default dead-letter behavior enabled and configure duplicate detection when provisioning the queue.

The producer sends a JSON `TrendReportQueueMessageDto` body, not a plain job id. Its Service Bus `MessageId` is a stable business key:

```text
trend-report:{UserId}:{PeriodStart}:v{DataVersion}
```

`RunId` is persisted on the Table Storage job row before enqueueing. The queue message carries the same `RunId`, and Service Bus `CorrelationId` is set to that value, so the same run can be followed through the producer logs, Service Bus message metadata, consumer logs, and Table Storage job row.

Runtime flow:

1. `CreateTrendReport` validates the request and captures the SQL snapshot.
2. `TrendReportService.SubmitAsync` returns 422 without creating a job when the selected period contains no training or pre-check data. Otherwise it reads the current user `DataVersion`. A non-empty snapshot without a stored version is treated as a consistency error.
3. The repository hashes normalized request dates + `DataVersion` into an internal dedup RowKey. An existing `Completed` job is reused. An explicit Generate after `Failed`, `Cancelled`, or `Superseded` creates a fresh job and conditionally moves the dedup row with its ETag.
4. Each user partition contains one fixed `active-job` lease. The dedup row, new job row, and lease are created in one Table transaction. While the lease exists, an identical submission returns its winning job and a different submission returns 409 without replacing or cancelling anything. If the current request has no dedup row, the repository verifies the leased job: a different request is a normal 409, while the same request, a missing job, or a mismatched RunId is treated as storage corruption. Explicit cancellation and every terminal worker transition update the job and delete its matching lease atomically.
5. A newly created durable `EnqueuePending` job is sent to Service Bus. After send succeeds, the job is marked `Queued`.
6. `ProcessTrendReportJob` validates the JSON message. Permanently invalid messages are sent to DLQ with a reason and description.
7. Valid messages call `TrendReportService.ProcessAsync`, which verifies the queue message `RunId` still matches the persisted job `RunId`, then atomically claims the job using the Table entity ETag.
8. The consumer checks both `RunId` and `DataVersion` before progress/result writes, generates selected charts, and stores the result on the job.
9. `RecoverPendingTrendReportEnqueues` periodically considers unstarted `EnqueuePending` jobs older than the recovery cutoff. It re-enqueues a job only while the user's `active-job` lease still references that exact JobId and RunId.
10. `GetTrendReport` returns status and results for frontend polling and refresh recovery. The frontend changes Generate to Cancel while a job is active. API responses contain user-facing messages only; internal identifiers and exception details remain in structured logs.

Report source data CRUD invalidation:

1. After pre-check or training save/delete succeeds, `TrendReportInvalidationService` initializes or bumps the user's Table `DataVersion`.
2. It scans active jobs for that user.
3. If the changed training date is inside an active job's target period or comparison period, the job is marked `Superseded`.
4. The consumer stops a `Superseded` job before writing more progress or a completed result.
5. The frontend marks the currently displayed report as `Outdated` after training save/delete and asks the user to generate a new report.
