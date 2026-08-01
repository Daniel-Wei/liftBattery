using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface IWeeklyReportQueue
{
    Task EnqueueAsync(
        WeeklyReportQueueMessageDto queueMessage,
        CancellationToken cancellationToken = default);
}
