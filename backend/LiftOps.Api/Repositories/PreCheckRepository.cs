using System.Collections.Concurrent;
using LiftOps.Api.Models;

namespace LiftOps.Api.Repositories;

public sealed class PreCheckRepository : IPreCheckRepository
{
    private readonly ConcurrentDictionary<DateOnly, PreCheckLog> _logsByDate = new();

    public Task<PreCheckLog?> GetByDateAsync(DateOnly date)
    {
        _logsByDate.TryGetValue(date, out var log);
        return Task.FromResult(log);
    }

    public Task<PreCheckLog> SaveAsync(PreCheckLog log)
    {
        _logsByDate.AddOrUpdate(log.Date, log, (_, _) => log);
        return Task.FromResult(log);
    }
}
