using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Repositories;

public sealed record StoredTrendReportPayload(
    string BlobName,
    string Sha256);

public interface ITrendReportPayloadStore
{
    Task<StoredTrendReportPayload> StoreResultAsync(
        int userId,
        Guid jobId,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default);

    Task<TrendReportResultDto> LoadResultAsync(
        string blobName,
        CancellationToken cancellationToken = default);
}
