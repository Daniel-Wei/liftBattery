using System.Data;
using LiftBattery.Api.Data;
using LiftBattery.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftBattery.Api.Repositories;

public sealed class TrendReportSourceDataRepository : ITrendReportSourceDataRepository
{
    private readonly LiftBatteryDbContext _dbContext;

    public TrendReportSourceDataRepository(LiftBatteryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task StageDataVersionChangeAsync(
        int userId,
        DateTimeOffset updatedAtUtc,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await _dbContext.Users.SingleOrDefaultAsync(
            candidate => candidate.Id == userId,
            cancellationToken);

        if (user is null)
        {
            throw new InvalidOperationException(
                $"Cannot update trend report DataVersion because user {userId} does not exist.");
        }

        // Do not call SaveChangesAsync here. The source repository must persist this
        // tracked User change together with its Training or PreCheck mutation so SQL
        // cannot commit the source data without also committing its new DataVersion.
        user.TrendReportDataVersion = CreateDataVersion(updatedAtUtc);
    }

    public async Task<TrendReportSourceDataCapture> CaptureSnapshotAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var executionStrategy = _dbContext.Database.CreateExecutionStrategy();
        return await executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _dbContext.Database.BeginTransactionAsync(
                IsolationLevel.Snapshot,
                cancellationToken);

            // All three reads use one SQL snapshot. 
            // A concurrent source CRUD therefore produces either old data + old version or new data + new version, 
            // never a snapshot assembled from one state and labelled with another state's version.
            var dataVersion = await _dbContext.Users
                .AsNoTracking()
                .Where(candidate => candidate.Id == userId)
                .Select(candidate => candidate.TrendReportDataVersion)
                .SingleOrDefaultAsync(cancellationToken);

            var trainingDayEntities = await _dbContext.TrainingDays
                .AsNoTracking()
                .Include(day => day.Sessions)
                    .ThenInclude(session => session.Exercises)
                        .ThenInclude(exercise => exercise.Sets)
                .Where(day => day.UserId == userId && day.Date >= from && day.Date <= to)
                .OrderBy(day => day.Date)
                .ToListAsync(cancellationToken);

            var preCheckEntities = await _dbContext.PreChecks
                .AsNoTracking()
                .Where(item => item.UserId == userId)
                .Where(item => item.PreCheckDate >= from && item.PreCheckDate <= to)
                .OrderBy(item => item.PreCheckDate)
                .ToListAsync(cancellationToken);

            var snapshot = new TrendReportReqSnapshot(
                trainingDayEntities.Select(TrainingRepository.ToModel).ToList(),
                preCheckEntities.Select(PreCheckRepository.ToModel).ToList());

            await transaction.CommitAsync(cancellationToken);
            return new TrendReportSourceDataCapture(dataVersion, snapshot);
        });
    }

    public Task<string?> GetCurrentDataVersionAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        return _dbContext.Users
            .AsNoTracking()
            .Where(candidate => candidate.Id == userId)
            .Select(candidate => candidate.TrendReportDataVersion)
            .SingleOrDefaultAsync(cancellationToken);
    }

    private static string CreateDataVersion(DateTimeOffset updatedAtUtc)
    {
        return $"{updatedAtUtc:yyyyMMddHHmmssfffffff}-{Guid.NewGuid():N}";
    }
}
