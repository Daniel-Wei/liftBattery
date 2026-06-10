using LiftOps.Api.DTOs;

namespace LiftOps.Api.Services;

public interface ITrainingLogService
{
    Task<IReadOnlyList<TrainingLogDto>> GetByDateRangeAsync(DateOnly from, DateOnly to);
    Task<TrainingLogDto> SaveAsync(TrainingLogDto dto);
}
