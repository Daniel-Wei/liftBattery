using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface ITrainingLogRepository
{
    Task<IReadOnlyList<TrainingSession>> GetByDateRangeAsync(DateOnly from, DateOnly to);
    Task<TrainingSession> SaveAsync(TrainingSession log);
    Task<TrainingSession?> DeleteByIdAsync(string id);
}
