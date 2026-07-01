using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrendReportService
{
    Task<TrendReportJobDto> CreateAsync(int userId, CreateTrendReportRequestDto request);
    Task<TrendReportJobDto?> GetByIdAsync(int userId, int id);
    Task ProcessAsync(TrendReportQueueMessageDto queueMessage, CancellationToken cancellationToken = default);
}
