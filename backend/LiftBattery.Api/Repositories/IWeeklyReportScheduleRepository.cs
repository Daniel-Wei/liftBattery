using Azure;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public sealed record WeeklyReportScheduleDocument(
    WeeklyReportSchedule Schedule,
    ETag ETag);

public interface IWeeklyReportScheduleRepository
{
    Task<WeeklyReportScheduleDocument?> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<WeeklyReportSchedule> UpsertForUserAsync(
        WeeklyReportSchedule schedule,
        ETag? etag = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WeeklyReportScheduleDocument>> GetEnabledAsync(
        CancellationToken cancellationToken = default);

    Task<bool> TryUpdateAsync(
        WeeklyReportSchedule schedule,
        ETag etag,
        CancellationToken cancellationToken = default);
}
