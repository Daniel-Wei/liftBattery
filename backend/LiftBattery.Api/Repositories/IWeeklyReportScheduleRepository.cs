using LiftBattery.Api.Entities;

namespace LiftBattery.Api.Repositories;

public sealed record WeeklyReportScheduleClaim(
    WeeklyReportSchedule Schedule,
    string ClaimToken);

public interface IWeeklyReportScheduleRepository
{
    Task<WeeklyReportSchedule?> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default);

    Task<WeeklyReportSchedule?> GetByIdAsync(
        string scheduleId,
        CancellationToken cancellationToken = default);

    Task<WeeklyReportSchedule> UpsertForUserAsync(
        WeeklyReportSchedule schedule,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WeeklyReportScheduleClaim>> ClaimDueAsync(
        DateTimeOffset nowUtc,
        DateTimeOffset leaseUntilUtc,
        string dispatcherId,
        int batchSize,
        CancellationToken cancellationToken = default);

    Task<bool> SetClaimedPeriodAsync(
        string scheduleId,
        string claimToken,
        string periodKey,
        CancellationToken cancellationToken = default);

    Task ReleaseClaimAsync(
        string scheduleId,
        string claimToken,
        CancellationToken cancellationToken = default);
}
