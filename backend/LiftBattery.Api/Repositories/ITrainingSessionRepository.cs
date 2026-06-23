using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface ITrainingLogRepository
{
    Task<IReadOnlyList<TrainingDayModel>> GetByDateRangeAsync(
        string userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    Task<TrainingDayModel> AddSessionAsync(
        string userId,
        DateOnly date,
        TrainingSessionModel session,
        CancellationToken cancellationToken = default);

    Task<TrainingSessionModel?> DeleteSessionAsync(
        string userId,
        string sessionId,
        CancellationToken cancellationToken = default);
}
