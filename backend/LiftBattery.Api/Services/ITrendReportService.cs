using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrendReportService
{
    Task<TrendReportJobDto> CreateAsync(CreateTrendReportRequestDto request);
    Task<TrendReportJobDto?> GetByIdAsync(string id);
    Task ProcessAsync(string jobId);
}
