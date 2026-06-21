using System.Collections.Concurrent;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public sealed class PreCheckRepository : IPreCheckRepository
{
    private readonly ConcurrentDictionary<DateOnly, PreCheckLog> _logsByDate = new();

    public Task<PreCheckLog?> GetByDateAsync(DateOnly date)
    {
        _logsByDate.TryGetValue(date, out var log);
        return Task.FromResult(log);
    }

    public Task<IReadOnlyList<PreCheckLog>> GetByDateRangeAsync(DateOnly from, DateOnly to)
    {
        var logs = _logsByDate.Values
            .Where(log => log.Date >= from && log.Date <= to)
            .OrderBy(log => log.Date)
            .ToList();

        return Task.FromResult<IReadOnlyList<PreCheckLog>>(logs);
    }

    public Task<PreCheckLog> SaveAsync(PreCheckLog log)
    {
        _logsByDate.AddOrUpdate(log.Date, log, (_, _) => log);
        return Task.FromResult(log);
    }

    public Task<PreCheckLog?> DeleteByIdAsync(string id)
    {
        foreach (var entry in _logsByDate)
        {
            if (entry.Value.Id != id)
            {
                continue;
            }

            if (_logsByDate.TryRemove(entry.Key, out var deletedLog))
            {
                return Task.FromResult<PreCheckLog?>(deletedLog);
            }
        }

        return Task.FromResult<PreCheckLog?>(null);
    }
}
