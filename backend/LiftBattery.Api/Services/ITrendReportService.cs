using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Services;

public interface ITrendReportService
{
    Task<TrendReportJobDto> SubmitAsync(
        int userId,
        CreateTrendReportRequestDto request,
        CancellationToken cancellationToken = default);
    Task<TrendReportJobDto?> GetByIdAsync(int userId, Guid id);
    Task<TrendReportJobDto?> CancelAsync(
        int userId,
        Guid id,
        CancellationToken cancellationToken = default);
    Task<TrendReportResultDto> GenerateResultAsync(int userId, CreateTrendReportRequestDto request);
    Task<int> RecoverUnstartedEnqueuesAsync(
        DateTimeOffset olderThanUtc,
        int maxCount,
        CancellationToken cancellationToken = default);
    Task<int> ConvergeTimedOutJobsAsync(
        DateTimeOffset queuedBeforeUtc,
        DateTimeOffset processingBeforeUtc,
        int maxCount,
        CancellationToken cancellationToken = default);
    Task ProcessAsync(
        TrendReportQueueMessageDto queueMessage,
        CancellationToken cancellationToken = default);
}
