using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using LiftBattery.Api.Models;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportBlobStorage : IWeeklyReportBlobStorage
{
    private readonly BlobContainerClient _container;
    private readonly Lazy<Task> _ensureContainerOnce;

    public WeeklyReportBlobStorage(IConfiguration configuration)
    {
        var connectionString = configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var containerName = configuration["WeeklyReportBlobContainerName"] ?? "weekly-reports";
        _container = new BlobContainerClient(connectionString, containerName);
        _ensureContainerOnce = new Lazy<Task>(() => _container.CreateIfNotExistsAsync());
    }

    public async Task<WeeklyReportBlob?> GetIfExistsAsync(
        string scheduleId,
        string periodKey,
        CancellationToken cancellationToken = default)
    {
        await _ensureContainerOnce.Value;
        var blobPath = GetBlobPath(scheduleId, periodKey);
        var blob = _container.GetBlobClient(blobPath);

        try
        {
            var response = await blob.DownloadContentAsync(cancellationToken);
            return new WeeklyReportBlob(blobPath, response.Value.Content.ToArray());
        }
        catch (RequestFailedException exception) when (exception.Status == 404)
        {
            return null;
        }
    }

    public async Task<byte[]> DownloadAsync(
        string blobPath,
        CancellationToken cancellationToken = default)
    {
        await _ensureContainerOnce.Value;
        var response = await _container
            .GetBlobClient(blobPath)
            .DownloadContentAsync(cancellationToken);
        return response.Value.Content.ToArray();
    }

    public async Task<string> UploadAsync(
        string scheduleId,
        string periodKey,
        WeeklyReportPdfMetadata metadata,
        byte[] pdfBytes,
        CancellationToken cancellationToken = default)
    {
        await _ensureContainerOnce.Value;
        var blobPath = GetBlobPath(scheduleId, periodKey);
        var blob = _container.GetBlobClient(blobPath);

        try
        {
            await using var stream = new MemoryStream(pdfBytes, writable: false);
            await blob.UploadAsync(
                stream,
                new BlobUploadOptions
                {
                    Conditions = new BlobRequestConditions { IfNoneMatch = ETag.All },
                    HttpHeaders = new BlobHttpHeaders { ContentType = "application/pdf" },
                    Metadata = new Dictionary<string, string>
                    {
                        ["scheduleId"] = scheduleId,
                        ["periodKey"] = periodKey,
                        ["reportingPeriodStart"] = metadata.ReportingPeriod.Start.ToString("yyyy-MM-dd"),
                        ["reportingPeriodEnd"] = metadata.ReportingPeriod.End.ToString("yyyy-MM-dd"),
                        ["sourceDataVersion"] = metadata.SourceDataVersion ?? "none",
                        ["dataSampledAtUtc"] = metadata.DataSampledAtUtc.ToString("O"),
                        ["generatedAtUtc"] = metadata.GeneratedAtUtc.ToString("O"),
                    },
                },
                cancellationToken);
        }
        catch (RequestFailedException exception) when (exception.Status is 409 or 412)
        {
            // The path is deterministic. A crash may have uploaded the PDF before
            // persisting BlobPath; the retry must reuse that immutable blob.
        }

        return blobPath;
    }

    private static string GetBlobPath(string scheduleId, string periodKey)
    {
        return $"schedules/{Uri.EscapeDataString(scheduleId)}/periods/{Uri.EscapeDataString(periodKey)}/weekly-report.pdf";
    }
}
