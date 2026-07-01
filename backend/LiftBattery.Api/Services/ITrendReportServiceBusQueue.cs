using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface ITrendReportServiceBusQueue
{
    Task EnqueueAsync(TrendReportQueueMessageDto queueMessage);
}
