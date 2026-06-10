using LiftOps.Api.DTOs;

namespace LiftOps.Api.Services;

public interface IPreCheckService
{
    Task<PreCheckDto?> GetTodayAsync();
    Task<PreCheckDto> SaveAsync(PreCheckDto dto);
}
