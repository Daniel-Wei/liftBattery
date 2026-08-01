using LiftBattery.Api.Models;

namespace LiftBattery.Api.Services;

public sealed record WeeklyReportBlob(string BlobPath, byte[] Content);

public interface IWeeklyReportBlobStorage
{
    Task<WeeklyReportBlob?> GetIfExistsAsync(
        string scheduleId,
        string periodKey,
        CancellationToken cancellationToken = default);

    Task<byte[]> DownloadAsync(
        string blobPath,
        CancellationToken cancellationToken = default);

    Task<string> UploadAsync(
        string scheduleId,
        string periodKey,
        WeeklyReportPdfMetadata metadata,
        byte[] pdfBytes,
        CancellationToken cancellationToken = default);
}
