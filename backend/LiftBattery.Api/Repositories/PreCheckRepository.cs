using LiftBattery.Api.Data;
using LiftBattery.Api.Data.Entities;
using LiftBattery.Api.Models;
using LiftBattery.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LiftBattery.Api.Repositories;

public sealed class PreCheckRepository : IPreCheckRepository
{
    private readonly LiftBatteryDbContext _dbContext;
    private readonly string _defaultUserId;

    public PreCheckRepository(
        LiftBatteryDbContext dbContext,
        IOptions<PreCheckOptions> options)
    {
        _dbContext = dbContext;
        _defaultUserId = options.Value.DefaultUserId;
    }

    public async Task<PreCheckLog?> GetByDateAsync(
        string userId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.PreChecks
            .AsNoTracking() // read-only, no need to monitor changes
            .SingleOrDefaultAsync(
                item => item.UserId == userId && item.PreCheckDate == date,
                cancellationToken);
        return entity is null ? null : ToModel(entity);
    }

    public async Task<IReadOnlyList<PreCheckLog>> GetByDateRangeAsync(
        string userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.PreChecks
            .AsNoTracking()  // read-only, no need to monitor changes
            .Where(item => item.UserId == userId)
            .Where(item => item.PreCheckDate >= from && item.PreCheckDate <= to)
            .OrderBy(item => item.PreCheckDate)
            .ToListAsync(cancellationToken);
        return entities.Select(ToModel).ToList();
    }

    public Task<IReadOnlyList<PreCheckLog>> GetByDateRangeAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
    {
        return GetByDateRangeAsync(_defaultUserId, from, to, cancellationToken);
    }

    public async Task<PreCheckLog> UpsertAsync(
        PreCheckLog log,
        CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.PreChecks.SingleOrDefaultAsync(
            item => item.UserId == log.UserId && item.PreCheckDate == log.Date,
            cancellationToken);

        if (entity is null)
        {
            entity = ToEntity(log);
            _dbContext.PreChecks.Add(entity);
        }
        else
        {
            Apply(log, entity);
        }

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException) when (_dbContext.Entry(entity).State == EntityState.Added)
        {
            _dbContext.Entry(entity).State = EntityState.Detached;
            entity = await _dbContext.PreChecks.SingleAsync(
                item => item.UserId == log.UserId && item.PreCheckDate == log.Date,
                cancellationToken);
            Apply(log, entity);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return ToModel(entity);
    }

    public async Task<PreCheckLog?> DeleteByIdAsync(
        string userId,
        string id,
        CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.PreChecks.SingleOrDefaultAsync(
            item => item.UserId == userId && item.Id == id,
            cancellationToken);

        if (entity is null)
        {
            return null;
        }

        _dbContext.PreChecks.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return ToModel(entity);
    }

    private static PreCheck ToEntity(PreCheckLog log)
    {
        return new PreCheck
        {
            Id = log.Id,
            UserId = log.UserId,
            PreCheckDate = log.Date,
            SleepHours = log.SleepHours,
            Soreness = log.SorenessRating,
            Motivation = log.MotivationRating,
            RestingHeartRateDelta = log.RestingHeartRateDelta,
            PreviousSessionRpe = log.PreviousSessionRpe,
            PreviousSessionDurationMinutes = log.PreviousSessionDurationMinutes,
            CreatedAtUtc = log.CreatedAtUtc,
            UpdatedAtUtc = log.UpdatedAtUtc,
        };
    }

    private static void Apply(PreCheckLog log, PreCheck entity)
    {
        entity.SleepHours = log.SleepHours;
        entity.Soreness = log.SorenessRating;
        entity.Motivation = log.MotivationRating;
        entity.RestingHeartRateDelta = log.RestingHeartRateDelta;
        entity.PreviousSessionRpe = log.PreviousSessionRpe;
        entity.PreviousSessionDurationMinutes = log.PreviousSessionDurationMinutes;
        entity.UpdatedAtUtc = log.UpdatedAtUtc;
    }

    private static PreCheckLog ToModel(PreCheck entity)
    {
        return new PreCheckLog(
            entity.Id,
            entity.UserId,
            entity.PreCheckDate,
            entity.SleepHours,
            entity.Soreness,
            entity.Motivation,
            entity.RestingHeartRateDelta,
            entity.PreviousSessionRpe,
            entity.PreviousSessionDurationMinutes,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc);
    }
}
