# Trend report Service Bus setup

The trend report flow requires:

- An Azure Service Bus queue named `trend-report-jobs`.
- `ServiceBusConnection` set to a Service Bus connection string with send and listen access.
- `TrendReportJobConvergenceTimer`, `TrendReportQueuedJobTimeoutMinutes`, and `TrendReportProcessingJobTimeoutMinutes` configured for stale-job convergence.
- `AzureWebJobsStorage` pointing to Azure Storage or Azurite with Table and Blob support enabled.

`TrendReportJobs` is created automatically in Table Storage, and the `TrendReportPayloadBlobContainerName` container defaults to `trend-report-payloads`. Table rows store status, request identity, Blob pointers, and the snapshot SHA-256; immutable snapshot/result JSON is stored in Blob Storage. The source `DataVersion` is stored on the SQL `Users.TrendReportDataVersion` column. The queue must be created before the Function App starts. Keep the queue's default dead-letter behavior enabled and configure duplicate detection when provisioning the queue.

Service Bus owns the retry budget and automatically dead-letters valid messages after the queue's `MaxDeliveryCount`. Application code does not mirror or guess that setting. An independent timer terminally fails jobs that exceed their configured business deadline and releases their matching active-job lease.

The producer sends a JSON `TrendReportQueueMessageDto` body, not a plain job id. Its Service Bus `MessageId` is a stable business key:

```text
{RunId}
```

`RunId` is persisted on the Table Storage job row before enqueueing and is unique to one job run. Re-sending that same run during enqueue recovery keeps the same `MessageId`, so Service Bus duplicate detection can suppress an uncertain duplicate send. A new run after cancellation or failure receives a new `RunId` and therefore cannot be mistaken for the previous job. The queue message carries the same `RunId`, and Service Bus `CorrelationId` is set to that value, so the run can be followed through the producer logs, Service Bus message metadata, consumer logs, and Table Storage job row.

Runtime flow:

1. `CreateTrendReport` validates the request and captures `DataVersion`, Training, and PreCheck in one SQL snapshot transaction. The migration enables SQL Server snapshot isolation for this boundary.
2. `TrendReportService.SubmitAsync` returns 422 without creating a job when the selected period contains no training or pre-check data. A non-empty capture without its SQL `DataVersion` is treated as a consistency error.
3. The repository hashes normalized request dates + `DataVersion` into an internal dedup RowKey. An existing `Completed` job is reused. An explicit Generate after `Failed`, `Cancelled`, or `Superseded` creates a fresh job and conditionally moves the dedup row with its ETag.
4. Each user partition contains one fixed `active-job` lease. For a new job, the repository first uploads a JobId-scoped immutable snapshot Blob, then creates the dedup row, job row with `SnapshotBlobName`/`SnapshotHash`, and lease in one Table transaction. A definite 409/412 transaction loser deletes its unreferenced candidate Blob. The repository reads the lease first: an active job with identical parameters is returned, while an active job with different parameters produces 409. A missing leased job or mismatched RunId is treated as storage corruption. Explicit cancellation and every terminal worker transition update the job and delete its matching lease atomically.
5. A newly created durable `EnqueuePending` job is sent to Service Bus. After send succeeds, the job is marked `Queued`.
6. `ProcessTrendReportJob` validates the JSON message. Permanently invalid messages are sent to DLQ with a reason and description.
7. Each valid delivery verifies `JobId`, `RunId`, `DataVersion`, the current SQL source `DataVersion`, and the current non-terminal status, then downloads the immutable snapshot Blob and verifies it against `SnapshotHash`. Moving `EnqueuePending` or `Queued` to `Processing` is best-effort display state; a redelivery may recompute an existing `Processing` job from the same verified snapshot.
8. Duplicate workers are allowed to compute, but they do not persist intermediate progress. A worker uploads its result to a content-addressed Blob before conditionally publishing `ResultBlobName` in the terminal Table transaction. Status checks and ETag ensure that only the first terminal writer wins and `Completed`, `Failed`, `Cancelled`, or `Superseded` cannot be overwritten.
9. Every valid-message processing exception leaves the job active and escapes the Function without settlement. Service Bus controls redelivery and eventual automatic DLQ using the queue's actual `MaxDeliveryCount`.
10. Completion is idempotent: duplicate workers producing identical JSON reuse the same content-addressed result Blob. If the terminal Table update succeeded but message completion did not, redelivery sees the terminal job, performs no processing write, and safely completes the message.
11. `RecoverPendingTrendReportEnqueues` periodically considers unstarted `EnqueuePending` jobs older than the recovery cutoff. It re-enqueues a job only while the user's `active-job` lease still references that exact JobId and RunId.
12. `ConvergeTimedOutTrendReportJobs` scans overdue `Queued` and `Processing` jobs. It re-reads each candidate and uses RunId, DataVersion, status, deadline, and ETag conditions before atomically writing `Failed` and releasing the matching active-job lease. A concurrent completion, cancellation, or supersession wins without being overwritten.
13. `GetTrendReport` returns status and results for frontend polling and refresh recovery. The frontend changes Generate to Cancel while a job is active. API responses contain user-facing messages only; internal identifiers and exception details remain in structured logs.

Report source data CRUD invalidation:

1. Pre-check and training save/delete stage a new `Users.TrendReportDataVersion` and commit it in the same SQL `SaveChangesAsync` transaction as the source mutation. `TrendReportInvalidationService` only reads that committed version.
2. It scans active jobs for that user.
3. Because DataVersion is global per user, every active job captured from an older version is conditionally marked `Superseded`, regardless of the changed row's date.
4. The consumer applies the same global version rule before processing and completion.
5. After any Training or Pre-check save/delete, the frontend reloads the displayed job from the backend instead of inventing a client-only status.
