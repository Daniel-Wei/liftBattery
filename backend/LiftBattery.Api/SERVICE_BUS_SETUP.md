# Trend report Service Bus setup

The trend report flow requires:

- An Azure Service Bus queue named `trend-report-jobs`.
- `ServiceBusConnection` set to a Service Bus connection string with send and listen access.
- `AzureWebJobsStorage` pointing to Azure Storage or Azurite with Table support enabled.

`TrendReportJobs` is created automatically in Table Storage. The queue must be created before the Function App starts. Keep the queue's default dead-letter behavior enabled and configure duplicate detection when provisioning the queue; the producer uses the report job id as the Service Bus `MessageId`.

Runtime flow:

1. `CreateTrendReport` validates the request, creates a durable Table job and sends its id to Service Bus.
2. `ProcessTrendReportJob` atomically claims the job using the Table entity ETag.
3. The consumer updates progress, generates selected charts and stores the result on the job.
4. `GetTrendReport` returns status and results for frontend polling and refresh recovery.
