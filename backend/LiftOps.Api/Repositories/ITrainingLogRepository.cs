using LiftOps.Api.Models;

namespace LiftOps.Api.Repositories;

public interface ITrainingLogRepository
{
    Task<IReadOnlyList<TrainingLog>> GetByDateRangeAsync(DateOnly from, DateOnly to);
    Task<TrainingLog> SaveAsync(TrainingLog log);
}
