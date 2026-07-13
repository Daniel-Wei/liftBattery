using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrendReportService
{
    Task<TrendReportJobDto> SubmitAsync(
        int userId,
        CreateTrendReportRequestDto request,
        CancellationToken cancellationToken = default);
    Task<TrendReportJobDto?> GetByIdAsync(int userId, int id);
    Task<TrendReportResultDto> GenerateResultAsync(int userId, CreateTrendReportRequestDto request);
    Task<int> RecoverUnstartedEnqueuesAsync(
        DateTimeOffset olderThanUtc,
        int maxCount,
        CancellationToken cancellationToken = default);
    Task ProcessAsync(TrendReportQueueMessageDto queueMessage, CancellationToken cancellationToken = default);
}
