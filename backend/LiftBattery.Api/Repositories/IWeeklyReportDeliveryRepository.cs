using LiftBattery.Api.Entities;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface IWeeklyReportDeliveryRepository
{
    Task<WeeklyReportDelivery?> TryClaimAsync(
        string scheduleId,
        WeeklyReportPeriod period,
        string processingClaimId,
        DateTimeOffset nowUtc,
        DateTimeOffset leaseUntilUtc,
        CancellationToken cancellationToken = default);

    Task<bool> RecordGenerationMetadataAsync(
        string scheduleId,
        string periodKey,
        string processingClaimId,
        string? sourceDataVersion,
        DateTimeOffset dataSampledAtUtc,
        DateTimeOffset generatedAtUtc,
        CancellationToken cancellationToken = default);

    Task<bool> MarkBlobReadyAsync(
        string scheduleId,
        string periodKey,
        string processingClaimId,
        string blobPath,
        CancellationToken cancellationToken = default);

    Task<bool> CompleteSentAsync(
        string scheduleId,
        string periodKey,
        string processingClaimId,
        string recipientEmail,
        DateTimeOffset sentAtUtc,
        DateTimeOffset nextRunAtUtc,
        CancellationToken cancellationToken = default);

    Task ReleaseClaimAsync(
        string scheduleId,
        string periodKey,
        string processingClaimId,
        string? errorMessage,
        CancellationToken cancellationToken = default);
}
