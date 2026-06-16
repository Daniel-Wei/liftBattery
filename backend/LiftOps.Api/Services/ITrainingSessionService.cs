using LiftOps.Api.DTOs;

namespace LiftOps.Api.Services;

public interface ITrainingSessionService
{
    Task<IReadOnlyList<TrainingSessionDto>> GetByDateRangeAsync(DateOnly from, DateOnly to);
    Task<TrainingSessionDto> SaveAsync(TrainingSessionDto dto);
}
