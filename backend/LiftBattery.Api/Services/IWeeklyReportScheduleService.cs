using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface IWeeklyReportScheduleService
{
    Task<WeeklyReportScheduleDto> GetForUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<WeeklyReportScheduleDto> SaveForUserAsync(
        int userId,
        UpdateWeeklyReportScheduleRequestDto request,
        CancellationToken cancellationToken = default);
    Task EnqueueDueReportsAsync(CancellationToken cancellationToken = default);
    Task ProcessAsync(WeeklyReportQueueMessageDto queueMessage, CancellationToken cancellationToken = default);
}
