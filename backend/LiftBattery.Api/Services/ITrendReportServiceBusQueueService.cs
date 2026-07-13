using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrendReportMessageQueueService
{
    Task EnqueueAsync(TrendReportQueueMessageDto queueMessageDTO, CancellationToken cancellationToken = default);
}
