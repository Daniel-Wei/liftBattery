using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface IWeeklyReportRepository
{
    Task<WeeklyReportSchedule?> GetScheduleAsync(int userId);
    Task<WeeklyReportSchedule> UpsertScheduleAsync(WeeklyReportSchedule schedule);
    Task<IReadOnlyList<WeeklyReportSchedule>> GetEnabledSchedulesAsync();
    Task<WeeklyReportJob?> GetJobAsync(string idempotencyKey);
    Task<WeeklyReportJob> CreateJobIfNotExistsAsync(WeeklyReportJob job);
    Task<WeeklyReportJob?> TryStartProcessingAsync(string idempotencyKey, DateTimeOffset startedAtUtc);
    Task<WeeklyReportJob> UpdateJobAsync(WeeklyReportJob job);
}
