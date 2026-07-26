using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public sealed record TrendReportSourceDataCapture(
    string? DataVersion,
    TrendReportReqSnapshot Snapshot);

public interface ITrendReportSourceDataRepository
{
    /// <summary>
    /// Stages a new DataVersion on the tracked SQL User row. The caller must include
    /// this change in the same SaveChangesAsync call as the Training or PreCheck CRUD.
    /// </summary>
    Task StageDataVersionChangeAsync(
        int userId,
        DateTimeOffset updatedAtUtc,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reads DataVersion, Training, and PreCheck from one SQL snapshot transaction.
    /// </summary>
    Task<TrendReportSourceDataCapture> CaptureSnapshotAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    Task<string?> GetCurrentDataVersionAsync(
        int userId,
        CancellationToken cancellationToken = default);
}
