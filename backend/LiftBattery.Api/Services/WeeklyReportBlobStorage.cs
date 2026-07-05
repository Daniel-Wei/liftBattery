using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportBlobStorage : IWeeklyReportBlobStorage
{
    private readonly IConfiguration _configuration;

    public WeeklyReportBlobStorage(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> UploadAsync(
        int userId,
        string weekStartDate,
        string weekEndDate,
        int dataVersion,
        string correlationId,
        byte[] pdfBytes,
        CancellationToken cancellationToken = default)
    {
        var connectionString = _configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var containerName = _configuration["WeeklyReportBlobContainerName"] ?? "weekly-reports";
        var blobName = $"weekly-reports/{userId}/{weekStartDate}/weekly-trends-report-v{dataVersion}.pdf";
        var container = new BlobContainerClient(connectionString, containerName);
        await container.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
        var blob = container.GetBlobClient(blobName);

        await using var stream = new MemoryStream(pdfBytes);
        await blob.UploadAsync(
            stream,
            new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = "application/pdf",
                },
                Metadata = new Dictionary<string, string>
                {
                    ["userId"] = userId.ToString(),
                    ["reportType"] = "WeeklyTrendsReport",
                    ["weekStartDate"] = weekStartDate,
                    ["weekEndDate"] = weekEndDate,
                    ["dataVersion"] = dataVersion.ToString(),
                    ["correlationId"] = correlationId,
                    ["generatedAt"] = DateTimeOffset.UtcNow.ToString("O"),
                },
            },
            cancellationToken);

        return blobName;
    }
}
