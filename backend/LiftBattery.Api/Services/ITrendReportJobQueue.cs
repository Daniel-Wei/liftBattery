using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrendReportJobQueue
{
    Task EnqueueAsync(
        TrendReportQueueMessageDto queueMessage,
        CancellationToken cancellationToken = default);
}
