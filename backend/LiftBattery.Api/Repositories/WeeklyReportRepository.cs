using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Repositories;

public sealed class WeeklyReportRepository : IWeeklyReportJobRepository
{
    private const string JobPartitionKeyPrefix = "weekly-report-user-";

    private readonly TableClient _tableClient;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);
    private readonly Lazy<Task> _ensureTableOnce;
    private readonly ILogger<WeeklyReportRepository> _logger;

    public WeeklyReportRepository(
        IConfiguration configuration,
        ILogger<WeeklyReportRepository> logger)
    {
        var connectionString = configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var tableName = configuration["WeeklyReportTableName"] ?? "WeeklyReportJobs";
        _tableClient = new TableClient(connectionString, tableName);
        _ensureTableOnce = new Lazy<Task>(async () =>
        {
            await _tableClient.CreateIfNotExistsAsync();
        });
        _logger = logger;
    }

    public async Task<WeeklyReportJob> CreateAsync(
        WeeklyReportJob job,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        try
        {
            await _tableClient.AddEntityAsync(ToEntity(job), cancellationToken);
            return job;
        }
        catch (RequestFailedException exception) when (exception.Status == 409)
        {
            return await GetLatestByUserIdAndRunKeyAsync(
                job.UserId,
                job.ScheduleId,
                job.RunKey,
                cancellationToken) ?? job;
        }
    }

    public async Task<WeeklyReportJob?> GetByIdAsync(
        int userId,
        int id,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<WeeklyReportJobEntity>(
                GetJobPartitionKey(userId),
                id.ToString(),
                cancellationToken: cancellationToken);
            return ToModel(response.Value);
        }
        catch (RequestFailedException exception) when (exception.Status == 404)
        {
            return null;
        }
    }

    public async Task<WeeklyReportJob?> GetLatestByUserIdAndRunKeyAsync(
        int userId,
        string scheduleId,
        string runKey,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();
        var partitionKey = GetJobPartitionKey(userId);
        var jobs = new List<WeeklyReportJob>();

        await foreach (var entity in _tableClient.QueryAsync<WeeklyReportJobEntity>(
            entity => entity.PartitionKey == partitionKey
                && entity.UserId == userId
                && entity.ScheduleId == scheduleId
                && entity.RunKey == runKey,
            cancellationToken: cancellationToken))
        {
            jobs.Add(ToModel(entity));
        }

        return jobs
            .OrderByDescending(job => job.CreatedAtUtc)
            .FirstOrDefault();
    }

    public Task<bool> TryStartProcessingAsync(
        int userId,
        int jobId,
        string runKey,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            runKey,
            entity =>
                entity.RunKey == runKey
                && entity.Status == WeeklyReportJobStatuses.Queued
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.Status = WeeklyReportJobStatuses.Processing;
                entity.StartedAtUtc = now;
            },
            "StartProcessing",
            cancellationToken);
    }

    public Task<bool> TryCompleteIfCurrentProcessingAsync(
        int userId,
        int jobId,
        string runKey,
        TrendReportResultDto result,
        string blobName,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            runKey,
            entity =>
                entity.RunKey == runKey
                && entity.Status == WeeklyReportJobStatuses.Processing
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.Status = WeeklyReportJobStatuses.Completed;
                entity.GeneratedAtUtc ??= now;
                entity.SentAtUtc = now;
                entity.CompletedAtUtc = now;
                entity.BlobName = blobName;
                entity.ResultJson = JsonSerializer.Serialize(result, _jsonOptions);
            },
            "Complete",
            cancellationToken);
    }

    public Task<bool> TryMarkFailedIfCurrentProcessingAsync(
        int userId,
        int jobId,
        string runKey,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        return TryUpdateEntityAsync(
            userId,
            jobId,
            runKey,
            entity =>
                entity.RunKey == runKey
                && entity.Status == WeeklyReportJobStatuses.Processing
                && entity.ErrorMessage is null,
            (entity, now) =>
            {
                entity.Status = WeeklyReportJobStatuses.Failed;
                entity.ErrorMessage = errorMessage;
                entity.CompletedAtUtc = now;
            },
            "MarkFailed",
            cancellationToken);
    }

    private async Task<bool> TryUpdateEntityAsync(
        int userId,
        int jobId,
        string runKey,
        Func<WeeklyReportJobEntity, bool> canUpdate,
        Action<WeeklyReportJobEntity, DateTimeOffset> applyUpdate,
        string operationName,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityIfExistsAsync<WeeklyReportJobEntity>(
                GetJobPartitionKey(userId),
                jobId.ToString(),
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
        catch (RequestFailedException exception) when (exception.Status is 404 or 412)
        {
            return false;
        }
        catch (RequestFailedException exception)
        {
            _logger.LogError(
                exception,
                "Failed to update weekly report job. Operation={Operation}, UserId={UserId}, JobId={JobId}, RunKey={RunKey}.",
                operationName,
                userId,
                jobId,
                runKey);
            return false;
        }
    }

    private Task EnsureTableAsync()
    {
        return _ensureTableOnce.Value;
    }

    private static string GetJobPartitionKey(int userId)
    {
        return $"{JobPartitionKeyPrefix}{userId}";
    }

    private WeeklyReportJobEntity ToEntity(WeeklyReportJob job)
    {
        return new WeeklyReportJobEntity
        {
            PartitionKey = GetJobPartitionKey(job.UserId),
            RowKey = job.Id.ToString(),
            Id = job.Id,
            UserId = job.UserId,
            ScheduleId = job.ScheduleId,
            RunKey = job.RunKey,
            ReportType = job.ReportType,
            WeekStartDate = job.WeekStartDate.ToString("yyyy-MM-dd"),
            WeekEndDate = job.WeekEndDate.ToString("yyyy-MM-dd"),
            ScheduledForUtc = job.ScheduledForUtc,
            TimeZoneId = job.TimeZoneId,
            RecipientEmail = job.RecipientEmail,
            DataVersion = job.DataVersion,
            Status = job.Status,
            CorrelationId = job.CorrelationId,
            RequestedAtUtc = job.RequestedAtUtc,
            CreatedAtUtc = job.CreatedAtUtc,
            UpdatedAtUtc = job.UpdatedAtUtc,
            StartedAtUtc = job.StartedAtUtc,
            GeneratedAtUtc = job.GeneratedAtUtc,
            SentAtUtc = job.SentAtUtc,
            CompletedAtUtc = job.CompletedAtUtc,
            BlobName = job.BlobName,
            ErrorMessage = job.ErrorMessage,
            ResultJson = job.Result is null ? null : JsonSerializer.Serialize(job.Result, _jsonOptions),
        };
    }

    private WeeklyReportJob ToModel(WeeklyReportJobEntity entity)
    {
        var result = string.IsNullOrWhiteSpace(entity.ResultJson)
            ? null
            : JsonSerializer.Deserialize<TrendReportResultDto>(entity.ResultJson, _jsonOptions);

        return new WeeklyReportJob(
            entity.Id,
            entity.UserId,
            entity.ScheduleId,
            entity.RunKey,
            entity.ReportType,
            DateOnly.Parse(entity.WeekStartDate),
            DateOnly.Parse(entity.WeekEndDate),
            entity.ScheduledForUtc,
            entity.TimeZoneId,
            entity.RecipientEmail,
            entity.DataVersion == 0 ? WeeklyReportConstants.DataVersion : entity.DataVersion,
            entity.Status,
            entity.CorrelationId,
            entity.RequestedAtUtc,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.StartedAtUtc,
            entity.GeneratedAtUtc,
            entity.SentAtUtc,
            entity.CompletedAtUtc,
            entity.BlobName,
            entity.ErrorMessage,
            result);
    }

    private sealed class WeeklyReportJobEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty;
        public string RowKey { get; set; } = string.Empty;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
        public int Id { get; set; }
        public int UserId { get; set; }
        public string ScheduleId { get; set; } = string.Empty;
        public string RunKey { get; set; } = string.Empty;
        public string ReportType { get; set; } = WeeklyReportConstants.ReportType;
        public string WeekStartDate { get; set; } = string.Empty;
        public string WeekEndDate { get; set; } = string.Empty;
        public DateTimeOffset ScheduledForUtc { get; set; }
        public string TimeZoneId { get; set; } = WeeklyReportConstants.DefaultTimeZoneId;
        public string RecipientEmail { get; set; } = string.Empty;
        public int DataVersion { get; set; } = WeeklyReportConstants.DataVersion;
        public string Status { get; set; } = WeeklyReportJobStatuses.Queued;
        public string CorrelationId { get; set; } = string.Empty;
        public DateTimeOffset RequestedAtUtc { get; set; }
        public DateTimeOffset CreatedAtUtc { get; set; }
        public DateTimeOffset UpdatedAtUtc { get; set; }
        public DateTimeOffset? StartedAtUtc { get; set; }
        public DateTimeOffset? GeneratedAtUtc { get; set; }
        public DateTimeOffset? SentAtUtc { get; set; }
        public DateTimeOffset? CompletedAtUtc { get; set; }
        public string? BlobName { get; set; }
        public string? ErrorMessage { get; set; }
        public string? ResultJson { get; set; }
    }
}
