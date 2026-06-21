using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface IPreCheckService
{
    Task<PreCheckDto?> GetTodayAsync();
    Task<PreCheckDto> SaveAsync(PreCheckDto dto);
    Task<PreCheckDto?> DeleteAsync(string id);
}
