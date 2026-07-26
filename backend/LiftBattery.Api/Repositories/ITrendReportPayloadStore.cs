using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public sealed record StoredTrendReportPayload(
    string BlobName,
    string Sha256);

public interface ITrendReportPayloadStore
{
    Task<StoredTrendReportPayload> StoreSnapshotAsync(
        int userId,
        Guid jobId,
        TrendReportReqSnapshot snapshot,
        CancellationToken cancellationToken = default);

    Task<TrendReportReqSnapshot> LoadSnapshotAsync(
        string blobName,
        string expectedSha256,
        CancellationToken cancellationToken = default);

    Task<StoredTrendReportPayload> StoreResultAsync(
        int userId,
        Guid jobId,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default);

    Task<TrendReportResultDto> LoadResultAsync(
        string blobName,
        CancellationToken cancellationToken = default);

    Task DeleteIfExistsAsync(
        string blobName,
        CancellationToken cancellationToken = default);
}