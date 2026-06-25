using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrainingSessionService
{
    Task<IReadOnlyList<TrainingDayDto>> GetByDateRangeAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    Task<TrainingDayDto> SaveSessionAsync(
        int userId,
        SaveTrainingSessionDto dto,
        CancellationToken cancellationToken = default);

    Task<TrainingSessionDto?> DeleteSessionAsync(
        int userId,
        int id,
        CancellationToken cancellationToken = default);
}
