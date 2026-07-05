using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Repositories;

public sealed class WeeklyReportRepository : IWeeklyReportRepository
{
    private const string SchedulePartitionKeyValue = "weekly-report-schedule";
    private const string JobPartitionKeyValue = "weekly-report-job";

    private readonly TableClient _tableClient;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    public WeeklyReportRepository(IConfiguration configuration)
    {
        var connectionString = configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var tableName = configuration["WeeklyReportTableName"] ?? "WeeklyReportJobs";
        _tableClient = new TableClient(connectionString, tableName);
    }

    public async Task<WeeklyReportSchedule?> GetScheduleAsync(int userId)
    {
        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<WeeklyReportScheduleEntity>(
                SchedulePartitionKeyValue,
                userId.ToString());
            return ToScheduleModel(response.Value);
        }
        catch (RequestFailedException exception) when (exception.Status == 404)
        {
            return null;
        }
    }

    public async Task<WeeklyReportSchedule> UpsertScheduleAsync(WeeklyReportSchedule schedule)
    {
        await EnsureTableAsync();
        await _tableClient.UpsertEntityAsync(ToScheduleEntity(schedule), TableUpdateMode.Replace);
        return schedule;
    }

    public async Task<IReadOnlyList<WeeklyReportSchedule>> GetEnabledSchedulesAsync()
    {
        await EnsureTableAsync();
        var schedules = new List<WeeklyReportSchedule>();

        await foreach (var entity in _tableClient.QueryAsync<WeeklyReportScheduleEntity>(
            entity => entity.PartitionKey == SchedulePartitionKeyValue && entity.Enabled))
        {
            schedules.Add(ToScheduleModel(entity));
        }

        return schedules;
    }

    public async Task<WeeklyReportJob?> GetJobAsync(string idempotencyKey)
    {
        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<WeeklyReportJobEntity>(
                JobPartitionKeyValue,
                idempotencyKey);
            return ToJobModel(response.Value);
        }
        catch (RequestFailedException exception) when (exception.Status == 404)
        {
            return null;
        }
    }

    public async Task<WeeklyReportJob> CreateJobIfNotExistsAsync(WeeklyReportJob job)
    {
        await EnsureTableAsync();

        try
        {
            await _tableClient.AddEntityAsync(ToJobEntity(job));
            return job;
        }
        catch (RequestFailedException exception) when (exception.Status == 409)
        {
            return await GetJobAsync(job.IdempotencyKey) ?? job;
        }
    }

    public async Task<WeeklyReportJob?> TryStartProcessingAsync(
        string idempotencyKey,
        DateTimeOffset startedAtUtc)
    {
        await EnsureTableAsync();

        try
        {
            var response = await _tableClient.GetEntityAsync<WeeklyReportJobEntity>(
                JobPartitionKeyValue,
                idempotencyKey);
            var entity = response.Value;

            if (entity.Status is WeeklyReportJobStatuses.Sent or WeeklyReportJobStatuses.Processing)
            {
                return null;
            }

            entity.Status = WeeklyReportJobStatuses.Processing;
            entity.StartedAtUtc ??= startedAtUtc;
            entity.UpdatedAtUtc = startedAtUtc;
            entity.ErrorMessage = null;
            await _tableClient.UpdateEntityAsync(entity, entity.ETag, TableUpdateMode.Replace);
            return ToJobModel(entity);
        }
        catch (RequestFailedException exception) when (exception.Status is 404 or 412)
        {
            return null;
        }
    }

    public async Task<WeeklyReportJob> UpdateJobAsync(WeeklyReportJob job)
    {
        await EnsureTableAsync();

        if (job.Status != WeeklyReportJobStatuses.Sent)
        {
            try
            {
                var current = await _tableClient.GetEntityAsync<WeeklyReportJobEntity>(
                    JobPartitionKeyValue,
                    job.IdempotencyKey);

                if (current.Value.Status == WeeklyReportJobStatuses.Sent)
                {
                    return ToJobModel(current.Value);
                }
            }
            catch (RequestFailedException exception) when (exception.Status == 404)
            {
                // Upsert below will recreate a missing row.
            }
        }

        await _tableClient.UpsertEntityAsync(ToJobEntity(job), TableUpdateMode.Replace);
        return job;
    }

    private Task EnsureTableAsync()
    {
        return _tableClient.CreateIfNotExistsAsync();
    }

    private static WeeklyReportScheduleEntity ToScheduleEntity(WeeklyReportSchedule schedule)
    {
        return new WeeklyReportScheduleEntity
        {
            PartitionKey = SchedulePartitionKeyValue,
            RowKey = schedule.UserId.ToString(),
            UserId = schedule.UserId,
            Enabled = schedule.Enabled,
            ScheduledTime = schedule.ScheduledTime.ToString("HH:mm"),
            RecipientEmail = schedule.RecipientEmail,
            Timezone = schedule.Timezone,
            ReportType = schedule.ReportType,
            CreatedAtUtc = schedule.CreatedAtUtc,
            UpdatedAtUtc = schedule.UpdatedAtUtc,
            DataVersion = schedule.DataVersion,
        };
    }

    private static WeeklyReportSchedule ToScheduleModel(WeeklyReportScheduleEntity entity)
    {
        return new WeeklyReportSchedule(
            entity.UserId,
            entity.Enabled,
            TimeOnly.Parse(entity.ScheduledTime),
            entity.RecipientEmail,
            entity.Timezone,
            string.IsNullOrWhiteSpace(entity.ReportType)
                ? WeeklyReportConstants.ReportType
                : entity.ReportType,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.DataVersion == 0 ? WeeklyReportConstants.DataVersion : entity.DataVersion);
    }

    private WeeklyReportJobEntity ToJobEntity(WeeklyReportJob job)
    {
        return new WeeklyReportJobEntity
        {
            PartitionKey = JobPartitionKeyValue,
            RowKey = job.IdempotencyKey,
            IdempotencyKey = job.IdempotencyKey,
            UserId = job.UserId,
            ReportType = job.ReportType,
            WeekStartDate = job.WeekStartDate.ToString("yyyy-MM-dd"),
            WeekEndDate = job.WeekEndDate.ToString("yyyy-MM-dd"),
            ScheduledTime = job.ScheduledTime,
            Timezone = job.Timezone,
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
            BlobName = job.BlobName,
            ErrorMessage = job.ErrorMessage,
            ResultJson = job.Result is null ? null : JsonSerializer.Serialize(job.Result, _jsonOptions),
        };
    }

    private WeeklyReportJob ToJobModel(WeeklyReportJobEntity entity)
    {
        var result = string.IsNullOrWhiteSpace(entity.ResultJson)
            ? null
            : JsonSerializer.Deserialize<TrendReportResultDto>(entity.ResultJson, _jsonOptions);

        return new WeeklyReportJob(
            entity.IdempotencyKey,
            entity.UserId,
            entity.ReportType,
            DateOnly.Parse(entity.WeekStartDate),
            DateOnly.Parse(entity.WeekEndDate),
            entity.ScheduledTime,
            entity.Timezone,
            entity.RecipientEmail,
            entity.DataVersion,
            entity.Status,
            entity.CorrelationId,
            entity.RequestedAtUtc,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc,
            entity.StartedAtUtc,
            entity.GeneratedAtUtc,
            entity.SentAtUtc,
            entity.BlobName,
            entity.ErrorMessage,
            result);
    }

    private sealed class WeeklyReportScheduleEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = SchedulePartitionKeyValue;
        public string RowKey { get; set; } = string.Empty;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
        public int UserId { get; set; }
        public bool Enabled { get; set; }
        public string ScheduledTime { get; set; } = "08:00";
        public string RecipientEmail { get; set; } = string.Empty;
        public string Timezone { get; set; } = "UTC";
        public string ReportType { get; set; } = WeeklyReportConstants.ReportType;
        public DateTimeOffset CreatedAtUtc { get; set; }
        public DateTimeOffset UpdatedAtUtc { get; set; }
        public int DataVersion { get; set; } = WeeklyReportConstants.DataVersion;
    }

    private sealed class WeeklyReportJobEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = JobPartitionKeyValue;
        public string RowKey { get; set; } = string.Empty;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
        public string IdempotencyKey { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string ReportType { get; set; } = WeeklyReportConstants.ReportType;
        public string WeekStartDate { get; set; } = string.Empty;
        public string WeekEndDate { get; set; } = string.Empty;
        public string ScheduledTime { get; set; } = string.Empty;
        public string Timezone { get; set; } = "UTC";
        public string RecipientEmail { get; set; } = string.Empty;
        public int DataVersion { get; set; } = WeeklyReportConstants.DataVersion;
        public string Status { get; set; } = WeeklyReportJobStatuses.Pending;
        public string CorrelationId { get; set; } = string.Empty;
        public DateTimeOffset RequestedAtUtc { get; set; }
        public DateTimeOffset CreatedAtUtc { get; set; }
        public DateTimeOffset UpdatedAtUtc { get; set; }
        public DateTimeOffset? StartedAtUtc { get; set; }
        public DateTimeOffset? GeneratedAtUtc { get; set; }
        public DateTimeOffset? SentAtUtc { get; set; }
        public string? BlobName { get; set; }
        public string? ErrorMessage { get; set; }
        public string? ResultJson { get; set; }
    }
}
