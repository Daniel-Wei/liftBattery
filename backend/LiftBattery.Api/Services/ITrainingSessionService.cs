using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrainingSessionService
{
    Task<IReadOnlyList<TrainingSessionDto>> GetByDateRangeAsync(DateOnly from, DateOnly to);
    Task<TrainingSessionDto> SaveAsync(TrainingSessionDto dto);
    Task<TrainingSessionDto?> DeleteAsync(string id);
}
