using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface ITrainingRepository
{
    Task<IReadOnlyList<TrainingDayModel>> GetByDateRangeAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    Task<TrainingDayModel> AddSessionAsync(
        int userId,
        DateOnly date,
        TrainingSessionModel session,
        CancellationToken cancellationToken = default);

    Task<TrainingSessionModel?> DeleteSessionAsync(
        int userId,
        int sessionId,
        CancellationToken cancellationToken = default);
}
