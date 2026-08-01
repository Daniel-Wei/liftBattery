using LiftBattery.Api.Data;
using LiftBattery.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace LiftBattery.Api.Repositories;

public sealed class WeeklyReportScheduleSqlRepository : IWeeklyReportScheduleRepository
{
    private readonly LiftBatteryDbContext _dbContext;

    public WeeklyReportScheduleSqlRepository(LiftBatteryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<WeeklyReportSchedule?> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.WeeklyReportSchedules
            .AsNoTracking()
            .SingleOrDefaultAsync(schedule => schedule.UserId == userId, cancellationToken);
    }

    public Task<WeeklyReportSchedule?> GetByIdAsync(
        string scheduleId,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.WeeklyReportSchedules
            .AsNoTracking()
            .SingleOrDefaultAsync(schedule => schedule.ScheduleId == scheduleId, cancellationToken);
    }

    public async Task<WeeklyReportSchedule> UpsertForUserAsync(
        WeeklyReportSchedule schedule,
        CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.WeeklyReportSchedules
            .SingleOrDefaultAsync(item => item.UserId == schedule.UserId, cancellationToken);

        if (existing is null)
        {
            _dbContext.WeeklyReportSchedules.Add(schedule);

            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
                return schedule;
            }
            catch (DbUpdateException)
            {
                // GET and PUT can race while creating the one-per-user row. The SQL
                // unique key chooses the winner; retry as an update only if it exists.
                _dbContext.Entry(schedule).State = EntityState.Detached;
                var winner = await _dbContext.WeeklyReportSchedules
                    .AsNoTracking()
                    .SingleOrDefaultAsync(item => item.UserId == schedule.UserId, cancellationToken);
                if (winner is null)
                {
                    throw;
                }

                // Returning the winning row is important when a read-created default
                // races a real settings update: the default must not overwrite it.
                return winner;
            }
        }

        existing.Enabled = schedule.Enabled;
        existing.DayOfWeek = schedule.DayOfWeek;
        existing.LocalSendTime = schedule.LocalSendTime;
        existing.TimeZoneId = schedule.TimeZoneId;
        existing.RecipientEmail = schedule.RecipientEmail;
        existing.NextRunAtUtc = schedule.NextRunAtUtc;
        existing.UpdatedAtUtc = schedule.UpdatedAtUtc;

        // A settings change invalidates an in-flight dispatcher claim. A message
        // already published still reloads this latest schedule before sending.
        existing.LeaseUntilUtc = null;
        existing.ClaimedBy = null;
        existing.ClaimedPeriodKey = null;
        _dbContext.Entry(existing).Property(item => item.LeaseUntilUtc).IsModified = true;
        _dbContext.Entry(existing).Property(item => item.ClaimedBy).IsModified = true;
        _dbContext.Entry(existing).Property(item => item.ClaimedPeriodKey).IsModified = true;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task<IReadOnlyList<WeeklyReportScheduleClaim>> ClaimDueAsync(
        DateTimeOffset nowUtc,
        DateTimeOffset leaseUntilUtc,
        string dispatcherId,
        int batchSize,
        CancellationToken cancellationToken = default)
    {
        if (batchSize <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(batchSize));
        }

        // This query is served by IX_WeeklyReportSchedule_Due. It reads only the
        // small schedule table; no training or pre-check rows are touched here.
        List<WeeklyReportSchedule> candidates;

        if (_dbContext.Database.ProviderName?.Contains("Sqlite", StringComparison.Ordinal) == true)
        {
            // SQLite cannot translate DateTimeOffset ordering/comparisons. This branch
            // exists for the in-memory integration tests; production SQL Server uses
            // the indexed query below.
            candidates = (await _dbContext.WeeklyReportSchedules
                    .AsNoTracking()
                    .Where(schedule => schedule.Enabled && schedule.NextRunAtUtc != null)
                    .ToListAsync(cancellationToken))
                .Where(schedule => schedule.NextRunAtUtc <= nowUtc
                    && (schedule.LeaseUntilUtc == null || schedule.LeaseUntilUtc < nowUtc))
                .OrderBy(schedule => schedule.NextRunAtUtc)
                .Take(batchSize)
                .ToList();
        }
        else
        {
            candidates = await _dbContext.WeeklyReportSchedules
                .AsNoTracking()
                .Where(schedule => schedule.Enabled
                    && schedule.NextRunAtUtc != null
                    && schedule.NextRunAtUtc <= nowUtc
                    && (schedule.LeaseUntilUtc == null || schedule.LeaseUntilUtc < nowUtc))
                .OrderBy(schedule => schedule.NextRunAtUtc)
                .Take(batchSize)
                .ToListAsync(cancellationToken);
        }

        var claims = new List<WeeklyReportScheduleClaim>(candidates.Count);

        foreach (var candidate in candidates)
        {
            var claimToken = $"{dispatcherId}:{Guid.NewGuid():N}";

            // Both Timer instances may read the same candidate. This conditional
            // UPDATE is the atomic winner election: only one receives row count 1.
            var updated = await _dbContext.WeeklyReportSchedules
                .Where(schedule => schedule.ScheduleId == candidate.ScheduleId
                    && schedule.Enabled
                    && schedule.NextRunAtUtc == candidate.NextRunAtUtc
                    && schedule.LeaseUntilUtc == candidate.LeaseUntilUtc)
                .ExecuteUpdateAsync(
                    setters => setters
                        .SetProperty(schedule => schedule.LeaseUntilUtc, leaseUntilUtc)
                        .SetProperty(schedule => schedule.ClaimedBy, claimToken)
                        .SetProperty(schedule => schedule.ClaimedPeriodKey, (string?)null)
                        .SetProperty(schedule => schedule.UpdatedAtUtc, nowUtc),
                    cancellationToken);

            if (updated == 1)
            {
                candidate.LeaseUntilUtc = leaseUntilUtc;
                candidate.ClaimedBy = claimToken;
                candidate.ClaimedPeriodKey = null;
                claims.Add(new WeeklyReportScheduleClaim(candidate, claimToken));
            }
        }

        return claims;
    }

    public async Task<bool> SetClaimedPeriodAsync(
        string scheduleId,
        string claimToken,
        string periodKey,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.WeeklyReportSchedules
            .Where(schedule => schedule.ScheduleId == scheduleId
                && schedule.ClaimedBy == claimToken)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(schedule => schedule.ClaimedPeriodKey, periodKey),
                cancellationToken) == 1;
    }

    public async Task ReleaseClaimAsync(
        string scheduleId,
        string claimToken,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.WeeklyReportSchedules
            .Where(schedule => schedule.ScheduleId == scheduleId
                && schedule.ClaimedBy == claimToken)
            .ExecuteUpdateAsync(
                setters => setters
                    .SetProperty(schedule => schedule.LeaseUntilUtc, (DateTimeOffset?)null)
                    .SetProperty(schedule => schedule.ClaimedBy, (string?)null)
                    .SetProperty(schedule => schedule.ClaimedPeriodKey, (string?)null),
                cancellationToken);
    }
}
