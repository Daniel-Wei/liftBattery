using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrendReportService
{
    Task<TrendReportJobDto> CreateAsync(CreateTrendReportRequestDto request);
    Task<TrendReportJobDto?> GetByIdAsync(int id);
    Task ProcessAsync(int jobId);
}
