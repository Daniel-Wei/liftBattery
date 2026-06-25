using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface IPreCheckRepository
{
    Task<PreCheckModel?> GetByDateAsync(
        int userId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PreCheckModel>> GetByDateRangeAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PreCheckModel>> GetByDateRangeAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    Task<PreCheckModel> UpsertAsync(
        PreCheckModel log,
        CancellationToken cancellationToken = default);

    Task<PreCheckModel?> DeleteByIdAsync(
        int userId,
        int id,
        CancellationToken cancellationToken = default);
}
