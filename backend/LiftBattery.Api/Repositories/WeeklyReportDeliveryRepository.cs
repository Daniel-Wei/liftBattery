using LiftBattery.Api.Data;
using LiftBattery.Api.Entities;
using LiftBattery.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftBattery.Api.Repositories;

public sealed class WeeklyReportDeliveryRepository : IWeeklyReportDeliveryRepository
{
    private readonly LiftBatteryDbContext _dbContext;

    public WeeklyReportDeliveryRepository(LiftBatteryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<WeeklyReportDelivery?> TryClaimAsync(
        string scheduleId,
        WeeklyReportPeriod period,
        string processingClaimId,
        DateTimeOffset nowUtc,
        DateTimeOffset leaseUntilUtc,
        CancellationToken cancellationToken = default)
    {
        var existing = await GetAsync(scheduleId, period.Key, cancellationToken);
        if (existing?.Status == WeeklyReportDeliveryStatuses.Sent)
        {
            return existing;
        }

        if (existing is null)
        {
            var delivery = new WeeklyReportDelivery
            {
                ScheduleId = scheduleId,
                PeriodKey = period.Key,
                ReportingPeriodStart = period.Start,
                ReportingPeriodEnd = period.End,
                Status = WeeklyReportDeliveryStatuses.Pending,
                ProcessingClaimId = processingClaimId,
                ProcessingLeaseUntilUtc = leaseUntilUtc,
                CreatedAtUtc = nowUtc,
                UpdatedAtUtc = nowUtc,
            };

            _dbContext.WeeklyReportDeliveries.Add(delivery);

            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
                _dbContext.Entry(delivery).State = EntityState.Detached;
                return delivery;
            }
            catch (DbUpdateException)
            {
                // Another copy of the same Service Bus message may have inserted the
                // UNIQUE (ScheduleId, PeriodKey) row first. Retry as a claimant only
                // when that winning row now exists; otherwise preserve the real error.
                _dbContext.Entry(delivery).State = EntityState.Detached;
                if (!await _dbContext.WeeklyReportDeliveries
                    .AsNoTracking()
                    .AnyAsync(item => item.ScheduleId == scheduleId
                        && item.PeriodKey == period.Key, cancellationToken))
                {
                    throw;
                }
            }
        }

        existing = await GetAsync(scheduleId, period.Key, cancellationToken)
            ?? throw new InvalidOperationException("Weekly report delivery disappeared during claim.");
        if (existing.Status == WeeklyReportDeliveryStatuses.Sent)
        {
            return existing;
        }

        if (existing.ProcessingClaimId != processingClaimId
            && existing.ProcessingLeaseUntilUtc is not null
            && existing.ProcessingLeaseUntilUtc >= nowUtc)
        {
            return null;
        }

        var updated = await _dbContext.WeeklyReportDeliveries
            .Where(delivery => delivery.ScheduleId == scheduleId
                && delivery.PeriodKey == period.Key
                && delivery.Status != WeeklyReportDeliveryStatuses.Sent
                && delivery.ProcessingClaimId == existing.ProcessingClaimId
                && delivery.ProcessingLeaseUntilUtc == existing.ProcessingLeaseUntilUtc)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(delivery => delivery.ProcessingClaimId, processingClaimId)
                    .SetProperty(delivery => delivery.ProcessingLeaseUntilUtc, leaseUntilUtc)
                    .SetProperty(delivery => delivery.UpdatedAtUtc, nowUtc),
                cancellationToken);

        if (updated == 1)
        {
            return await GetAsync(scheduleId, period.Key, cancellationToken);
        }

        // A duplicate can safely finish when the winning worker already marked Sent.
        // Otherwise null means another live worker owns this period's processing lease.
        var latest = await GetAsync(scheduleId, period.Key, cancellationToken);
        return latest?.Status == WeeklyReportDeliveryStatuses.Sent ? latest : null;
    }

    public async Task<bool> RecordGenerationMetadataAsync(
        string scheduleId,
        string periodKey,
        string processingClaimId,
        string? sourceDataVersion,
        DateTimeOffset dataSampledAtUtc,
        DateTimeOffset generatedAtUtc,
        CancellationToken cancellationToken = default)
    {
        return await OwnedDelivery(scheduleId, periodKey, processingClaimId)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(delivery => delivery.SourceDataVersion, sourceDataVersion)
                    .SetProperty(delivery => delivery.DataSampledAtUtc, dataSampledAtUtc)
                    .SetProperty(delivery => delivery.GeneratedAtUtc, generatedAtUtc)
                    .SetProperty(delivery => delivery.LastError, (string?)null)
                    .SetProperty(delivery => delivery.UpdatedAtUtc, generatedAtUtc),
                cancellationToken) == 1;
    }

    public async Task<bool> MarkBlobReadyAsync(
        string scheduleId,
        string periodKey,
        string processingClaimId,
        string blobPath,
        CancellationToken cancellationToken = default)
    {
        return await OwnedDelivery(scheduleId, periodKey, processingClaimId)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(delivery => delivery.BlobPath, blobPath)
                    .SetProperty(delivery => delivery.Status, WeeklyReportDeliveryStatuses.BlobReady),
                cancellationToken) == 1;
    }

    public async Task<bool> CompleteSentAsync(
        string scheduleId,
        string periodKey,
        string processingClaimId,
        string recipientEmail,
        DateTimeOffset sentAtUtc,
        DateTimeOffset nextRunAtUtc,
        CancellationToken cancellationToken = default)
    {
        var strategy = _dbContext.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            _dbContext.ChangeTracker.Clear();
            await using var transaction = await _dbContext.Database
                .BeginTransactionAsync(cancellationToken);
            var delivery = await _dbContext.WeeklyReportDeliveries
                .SingleOrDefaultAsync(item => item.ScheduleId == scheduleId
                    && item.PeriodKey == periodKey, cancellationToken);

            // Commit-outcome ambiguity can cause the execution strategy to rerun after
            // the first SQL transaction actually committed. Sent is already success.
            if (delivery?.Status == WeeklyReportDeliveryStatuses.Sent)
            {
                return true;
            }

            if (delivery is null
                || delivery.ProcessingClaimId != processingClaimId
                || string.IsNullOrWhiteSpace(delivery.BlobPath))
            {
                return false;
            }

            if (delivery.Status != WeeklyReportDeliveryStatuses.Sent)
            {
                delivery.Status = WeeklyReportDeliveryStatuses.Sent;
                delivery.RecipientEmail = recipientEmail;
                delivery.SentAtUtc = sentAtUtc;
                delivery.ProcessingClaimId = null;
                delivery.ProcessingLeaseUntilUtc = null;
                delivery.LastError = null;
                delivery.UpdatedAtUtc = sentAtUtc;
            }

            var schedule = await _dbContext.WeeklyReportSchedules
                .SingleAsync(item => item.ScheduleId == scheduleId, cancellationToken);

            // A user edit clears ClaimedPeriodKey. In that race the newly calculated
            // NextRunAtUtc must win; the old delivery may be recorded as Sent but must
            // not overwrite the user's latest scheduling choice.
            if (schedule.ClaimedPeriodKey == periodKey)
            {
                schedule.LastRunAtUtc = sentAtUtc;
                schedule.LastPeriodKey = periodKey;
                schedule.NextRunAtUtc = nextRunAtUtc;
                schedule.LeaseUntilUtc = null;
                schedule.ClaimedBy = null;
                schedule.ClaimedPeriodKey = null;
                schedule.UpdatedAtUtc = sentAtUtc;
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return true;
        });
    }

    public async Task ReleaseClaimAsync(
        string scheduleId,
        string periodKey,
        string processingClaimId,
        string? errorMessage,
        CancellationToken cancellationToken = default)
    {
        await OwnedDelivery(scheduleId, periodKey, processingClaimId)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(delivery => delivery.ProcessingClaimId, (string?)null)
                    .SetProperty(delivery => delivery.ProcessingLeaseUntilUtc, (DateTimeOffset?)null)
                    .SetProperty(
                        delivery => delivery.LastError,
                        errorMessage == null ? null : Truncate(errorMessage, 2000)),
                cancellationToken);
    }

    private Task<WeeklyReportDelivery?> GetAsync(
        string scheduleId,
        string periodKey,
        CancellationToken cancellationToken)
    {
        return _dbContext.WeeklyReportDeliveries
            .AsNoTracking()
            .SingleOrDefaultAsync(delivery => delivery.ScheduleId == scheduleId
                && delivery.PeriodKey == periodKey, cancellationToken);
    }

    private IQueryable<WeeklyReportDelivery> OwnedDelivery(
        string scheduleId,
        string periodKey,
        string processingClaimId)
    {
        return _dbContext.WeeklyReportDeliveries.Where(delivery =>
            delivery.ScheduleId == scheduleId
            && delivery.PeriodKey == periodKey
            && delivery.Status != WeeklyReportDeliveryStatuses.Sent
            && delivery.ProcessingClaimId == processingClaimId);
    }

    private static string Truncate(string value, int maxLength)
    {
        return value.Length <= maxLength ? value : value[..maxLength];
    }
}
