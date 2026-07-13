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
2. `TrendReportService.SubmitAsync` reads the current user `DataVersion` and calculates a report fingerprint from request + snapshot + `DataVersion`.
3. If a usable job already exists for the same fingerprint and `DataVersion`, the existing job is returned and no new message is sent.
4. If another active job exists for older data, it is marked `Cancelled`.
5. A durable `Queued` Table job is created and a `TrendReportQueueMessageDto` is sent to Service Bus.
6. `ProcessTrendReportJob` validates the JSON message. Permanently invalid messages are sent to DLQ with a reason and description.
7. Valid messages call `TrendReportService.ProcessAsync`, which verifies the queue message `RunId` still matches the persisted job `RunId`, then atomically claims the job using the Table entity ETag.
8. The consumer checks both `RunId` and `DataVersion` before progress/result writes, generates selected charts, and stores the result on the job.
9. `GetTrendReport` returns status and results for frontend polling and refresh recovery.

Training CRUD invalidation:

1. After training save/delete succeeds, `TrendReportInvalidationService` bumps the user's Table `DataVersion`.
2. It scans active jobs for that user.
3. If the changed training date is inside a job's target period or comparison period:
   - `Queued` jobs are marked `Superseded`.
   - `Processing` jobs are marked `CancelRequested`.
4. The consumer cooperatively stops a `CancelRequested` job before writing more progress or a completed result, then finalizes it as `Superseded`.
5. The frontend marks the currently displayed report as `Outdated` after training save/delete and asks the user to generate a new report.
