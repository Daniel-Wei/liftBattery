using LiftOps.Api.Models;

namespace LiftOps.Api.Repositories;

public interface ITrainingLogRepository
{
    Task<IReadOnlyList<TrainingSession>> GetByDateRangeAsync(DateOnly from, DateOnly to);
    Task<TrainingSession> SaveAsync(TrainingSession log);
}
