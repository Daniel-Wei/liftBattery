using System.Collections.Concurrent;
using LiftOps.Api.Models;

namespace LiftOps.Api.Repositories;

public sealed class TrainingLogRepository : ITrainingLogRepository
{
    private readonly ConcurrentDictionary<string, TrainingLog> _logsById = new();

    public Task<IReadOnlyList<TrainingLog>> GetByDateRangeAsync(DateOnly from, DateOnly to)
    {
        var logs = _logsById.Values
            .Where(log => log.Date >= from && log.Date <= to)
            .OrderBy(log => log.Date)
            .ToList();

        return Task.FromResult<IReadOnlyList<TrainingLog>>(logs);
    }

    public Task<TrainingLog> SaveAsync(TrainingLog log)
    {
        _logsById.AddOrUpdate(log.Id, log, (_, _) => log);
        return Task.FromResult(log);
    }
}
