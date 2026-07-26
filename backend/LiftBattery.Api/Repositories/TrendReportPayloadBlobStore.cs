using System.Globalization;
using System.Security.Cryptography;
using System.Text.Json;
using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Repositories;

public sealed class TrendReportPayloadBlobStore : ITrendReportPayloadStore
{
    private const int HttpNotFoundStatusCode = 404;
    private const int HttpConflictStatusCode = 409;
    private const int HttpPreconditionFailedStatusCode = 412;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly BlobContainerClient _container;
    private readonly Lazy<Task> _ensureContainerOnce;

    public TrendReportPayloadBlobStore(IConfiguration configuration)
    {
        var connectionString = configuration["AzureWebJobsStorage"]
            ?? throw new InvalidOperationException("AzureWebJobsStorage is required.");
        var containerName = configuration["TrendReportPayloadBlobContainerName"]
            ?? "trend-report-payloads";

        _container = new BlobContainerClient(connectionString, containerName);
        _ensureContainerOnce = new Lazy<Task>(async () =>
        {
            await _container.CreateIfNotExistsAsync();
        });
    }

    public Task<StoredTrendReportPayload> StoreSnapshotAsync(
        int userId,
        Guid jobId,
        TrendReportReqSnapshot snapshot,
        CancellationToken cancellationToken = default)
    {
        return StorePayloadAsync(
            userId,
            jobId,
            payloadType: "snapshot",
            snapshot,
            cancellationToken);
    }

    public async Task<TrendReportReqSnapshot> LoadSnapshotAsync(
        string blobName,
        string expectedSha256,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(expectedSha256))
        {
            throw new InvalidOperationException(
                $"Trend report snapshot blob {blobName} has no stored SHA-256 hash.");
        }

        var content = await DownloadAndVerifyAsync(
            blobName,
            expectedSha256,
            cancellationToken);
        return DeserializePayload<TrendReportReqSnapshot>(content, blobName);
    }

    public Task<StoredTrendReportPayload> StoreResultAsync(
        int userId,
        Guid jobId,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default)
    {
        return StorePayloadAsync(
            userId,
            jobId,
            payloadType: "result",
            result,
            cancellationToken);
    }

    public async Task<TrendReportResultDto> LoadResultAsync(
        string blobName,
        CancellationToken cancellationToken = default)
    {
        var expectedSha256 = GetContentHashFromBlobName(blobName, "result");
        var content = await DownloadAndVerifyAsync(
            blobName,
            expectedSha256,
            cancellationToken);
        return DeserializePayload<TrendReportResultDto>(content, blobName);
    }

    public async Task DeleteIfExistsAsync(
        string blobName,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await EnsureContainerAsync();
        await _container.DeleteBlobIfExistsAsync(
            blobName,
            DeleteSnapshotsOption.IncludeSnapshots,
            cancellationToken: cancellationToken);
    }

    private async Task<StoredTrendReportPayload> StorePayloadAsync<TPayload>(
        int userId,
        Guid jobId,
        string payloadType,
        TPayload payload,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await EnsureContainerAsync();

        var content = JsonSerializer.SerializeToUtf8Bytes(payload, JsonOptions);
        var sha256 = ComputeSha256(content);
        var blobName = GetBlobName(userId, jobId, payloadType, sha256);
        var blob = _container.GetBlobClient(blobName);
        var options = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders
            {
                ContentType = "application/json",
            },
            Conditions = new BlobRequestConditions
            {
                IfNoneMatch = ETag.All,
            },
            Metadata = new Dictionary<string, string>
            {
                ["userId"] = userId.ToString(CultureInfo.InvariantCulture),
                ["jobId"] = jobId.ToString("N"),
                ["payloadType"] = payloadType,
                ["sha256"] = sha256,
            },
        };

        try
        {
            await using var stream = new MemoryStream(content, writable: false);
            await blob.UploadAsync(stream, options, cancellationToken);
        }
        catch (RequestFailedException exception) when (exception.Status is HttpConflictStatusCode
            or HttpPreconditionFailedStatusCode)
        {
            // Duplicate workers may produce the same immutable payload concurrently.
            // Treat an existing byte-identical content-addressed blob as a successful write.
            var existingContent = await DownloadBytesAsync(blobName, cancellationToken);

            if (!existingContent.AsSpan().SequenceEqual(content))
            {
                throw new InvalidOperationException(
                    $"Trend report {payloadType} blob {blobName} already exists with different content.",
                    exception);
            }
        }

        return new StoredTrendReportPayload(blobName, sha256);
    }

    private async Task<byte[]> DownloadAndVerifyAsync(
        string blobName,
        string expectedSha256,
        CancellationToken cancellationToken)
    {
        var content = await DownloadBytesAsync(blobName, cancellationToken);
        var actualSha256 = ComputeSha256(content);

        if (!string.Equals(actualSha256, expectedSha256, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"Trend report payload blob {blobName} failed SHA-256 validation.");
        }

        return content;
    }

    private async Task<byte[]> DownloadBytesAsync(
        string blobName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(blobName))
        {
            throw new InvalidOperationException("Trend report payload blob name is missing.");
        }

        await EnsureContainerAsync();
        var blob = _container.GetBlobClient(blobName);

        try
        {
            var response = await blob.DownloadContentAsync(cancellationToken);
            return response.Value.Content.ToArray();
        }
        catch (RequestFailedException exception) when (exception.Status == HttpNotFoundStatusCode)
        {
            throw new InvalidOperationException(
                $"Trend report payload blob {blobName} was not found.",
                exception);
        }
    }

    private Task EnsureContainerAsync()
    {
        return _ensureContainerOnce.Value;
    }

    private static TPayload DeserializePayload<TPayload>(byte[] content, string blobName)
    {
        return JsonSerializer.Deserialize<TPayload>(content, JsonOptions)
            ?? throw new InvalidOperationException(
                $"Trend report payload blob {blobName} is empty or invalid.");
    }

    private static string ComputeSha256(byte[] content)
    {
        return Convert.ToHexString(SHA256.HashData(content)).ToLowerInvariant();
    }

    private static string GetBlobName(
        int userId,
        Guid jobId,
        string payloadType,
        string sha256)
    {
        return $"users/{userId}/jobs/{jobId:N}/{payloadType}-{sha256}.json";
    }

    private static string GetContentHashFromBlobName(string blobName, string payloadType)
    {
        var fileNameStart = blobName.LastIndexOf('/') + 1;
        var fileName = blobName[fileNameStart..];
        var prefix = $"{payloadType}-";
        const string suffix = ".json";

        if (!fileName.StartsWith(prefix, StringComparison.Ordinal)
            || !fileName.EndsWith(suffix, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"Trend report payload blob name {blobName} is invalid.");
        }

        var hash = fileName[prefix.Length..^suffix.Length];

        if (hash.Length != 64 || hash.Any(character => !Uri.IsHexDigit(character)))
        {
            throw new InvalidOperationException(
                $"Trend report payload blob name {blobName} has an invalid SHA-256 hash.");
        }

        return hash;
    }
}