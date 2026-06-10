using LiftOps.Api.Models;

namespace LiftOps.Api.Repositories;

public interface IPreCheckRepository
{
    Task<PreCheckLog?> GetByDateAsync(DateOnly date);
    Task<PreCheckLog> SaveAsync(PreCheckLog log);
}
