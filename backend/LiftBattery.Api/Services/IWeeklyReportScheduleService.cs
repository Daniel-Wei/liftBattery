using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface IWeeklyReportSchedulingService
{
    Task<WeeklyReportScheduleDto> GetForUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<WeeklyReportScheduleDto> SaveForUserAsync(
        int userId,
        UpdateWeeklyReportScheduleRequestDto request,
        CancellationToken cancellationToken = default);
    Task ProcessDueSchedulesAsync(CancellationToken cancellationToken = default);
}

public interface IWeeklyReportJobService
{
    Task ProcessAsync(WeeklyReportQueueMessageDto queueMessage, CancellationToken cancellationToken = default);
}
