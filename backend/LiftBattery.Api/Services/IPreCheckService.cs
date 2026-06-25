using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface IPreCheckService
{
    Task<PreCheckDto?> GetByDateAsync(
        int userId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PreCheckDto>> GetByDateRangeAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default);

    Task<PreCheckDto> SaveAsync(
        int userId,
        PreCheckDto dto,
        CancellationToken cancellationToken = default);

    Task<PreCheckDto?> DeleteAsync(
        int userId,
        int id,
        CancellationToken cancellationToken = default);
}
