using System.Text.Json;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using LiftBattery.Api.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Repositories;

public sealed class WeeklyReportScheduleBlobRepository : IWeeklyReportScheduleRepository
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly BlobContainerClient _container;
    private readonly ILogger<WeeklyReportScheduleBlobRepository> _logger;
    private readonly Lazy<Task> _ensureContainerOnce;

    public WeeklyReportScheduleBlobRepository(
        IConfiguration configuration,
        ILogger<WeeklyReportScheduleBlobRepository> logger)
    {
        var connectionString = configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var containerName = configuration["WeeklyReportScheduleBlobContainerName"]
            ?? "weekly-report-schedules";
        _container = new BlobContainerClient(connectionString, containerName);
        _logger = logger;
        _ensureContainerOnce = new Lazy<Task>(async () =>
        {
            await _container.CreateIfNotExistsAsync();
        });
    }

    public async Task<WeeklyReportScheduleDocument?> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await EnsureContainerAsync();

        var blob = _container.GetBlobClient(GetBlobName(userId));

        try
        {
            return await DownloadAsync(blob, cancellationToken);
        }
        catch (RequestFailedException exception) when (exception.Status == 404)
        {
            return null;
        }
    }

    public async Task<WeeklyReportSchedule> UpsertForUserAsync(
        WeeklyReportSchedule schedule,
        ETag? etag = null,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await EnsureContainerAsync();

        var blob = _container.GetBlobClient(GetBlobName(schedule.UserId));
        var options = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders
            {
                ContentType = "application/json",
            },
            Conditions = etag.HasValue
                ? new BlobRequestConditions { IfMatch = etag.Value }
                : new BlobRequestConditions { IfNoneMatch = ETag.All },
        };

        await using var stream = CreateContentStream(schedule);
        await blob.UploadAsync(stream, options, cancellationToken);
        return schedule;
    }

    public async Task<IReadOnlyList<WeeklyReportScheduleDocument>> GetEnabledAsync(
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await EnsureContainerAsync();

        var schedules = new List<WeeklyReportScheduleDocument>();

        await foreach (var blobItem in _container.GetBlobsAsync(
            prefix: "users/",
            cancellationToken: cancellationToken))
        {
            cancellationToken.ThrowIfCancellationRequested();

            var blob = _container.GetBlobClient(blobItem.Name);

            try
            {
                var document = await DownloadAsync(blob, cancellationToken);

                if (document.Schedule.Enabled)
                {
                    schedules.Add(document);
                }
            }
            catch (RequestFailedException exception) when (exception.Status == 404)
            {
                _logger.LogInformation(
                    "Weekly report schedule blob disappeared during scan. BlobName={BlobName}.",
                    blobItem.Name);
            }
            catch (JsonException exception)
            {
                _logger.LogWarning(
                    exception,
                    "Skipping invalid weekly report schedule blob. BlobName={BlobName}.",
                    blobItem.Name);
            }
        }

        return schedules;
    }

    public async Task<bool> TryUpdateAsync(
        WeeklyReportSchedule schedule,
        ETag etag,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await EnsureContainerAsync();

        try
        {
            await UpsertForUserAsync(schedule, etag, cancellationToken);
            return true;
        }
        catch (RequestFailedException exception) when (exception.Status is 404 or 409 or 412)
        {
            _logger.LogInformation(
                exception,
                "Weekly report schedule update skipped because blob ETag changed. UserId={UserId}, ScheduleId={ScheduleId}.",
                schedule.UserId,
                schedule.ScheduleId);
            return false;
        }
    }

    private Task EnsureContainerAsync()
    {
        return _ensureContainerOnce.Value;
    }

    private static async Task<WeeklyReportScheduleDocument> DownloadAsync(
        BlobClient blob,
        CancellationToken cancellationToken)
    {
        var response = await blob.DownloadContentAsync(cancellationToken);
        var schedule = response.Value.Content.ToObjectFromJson<WeeklyReportSchedule>(JsonOptions)
            ?? throw new InvalidOperationException("Weekly report schedule blob is empty.");
        return new WeeklyReportScheduleDocument(schedule, response.Value.Details.ETag);
    }

    private static MemoryStream CreateContentStream(WeeklyReportSchedule schedule)
    {
        return new MemoryStream(JsonSerializer.SerializeToUtf8Bytes(schedule, JsonOptions));
    }

    private static string GetBlobName(int userId)
    {
        return $"users/{userId}/weekly-report-schedule.json";
    }
}
