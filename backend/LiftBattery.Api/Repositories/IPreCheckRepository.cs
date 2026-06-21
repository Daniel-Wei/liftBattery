using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface IPreCheckRepository
{
    Task<PreCheckLog?> GetByDateAsync(DateOnly date);
    Task<IReadOnlyList<PreCheckLog>> GetByDateRangeAsync(DateOnly from, DateOnly to);
    Task<PreCheckLog> SaveAsync(PreCheckLog log);
    Task<PreCheckLog?> DeleteByIdAsync(string id);
}
