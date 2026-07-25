using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;

namespace LiftBattery.Api.Services;

public sealed class TrendReportInvalidationService : ITrendReportInvalidationService
{
    private readonly ITrendReportJobRepository _jobRepository;

    public TrendReportInvalidationService(ITrendReportJobRepository jobRepository)
    {
        _jobRepository = jobRepository;
    }

    public async Task InvalidateForReportDataChangeAsync(
        int userId,
        DateOnly changedDate,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var newDataVersion = await _jobRepository.BumpDataVersionAsync(
            userId,
            DateTimeOffset.UtcNow,
            cancellationToken);
        var activeJobs = await _jobRepository.GetActiveByUserIdAsync(userId, cancellationToken);

        foreach (var job in activeJobs)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (string.Equals(job.DataVersion, newDataVersion, StringComparison.Ordinal)
                || !RequestContainsDate(job.Request, changedDate))
            {
                continue;
            }

            await _jobRepository.TryMarkSupersededIfCurrentAsync(
                userId,
                job.RunId,
                job.Id,
                job.DataVersion,
                cancellationToken);
        }
    }

    private static bool RequestContainsDate(TrendReportRequest request, DateOnly changedDate)
    {
        if (DateIsInRange(changedDate, request.StartWeek, request.EndWeek.AddDays(6)))
        {
            return true;
        }

        return request.ComparisonStartWeek.HasValue
            && request.ComparisonEndWeek.HasValue
            && DateIsInRange(
                changedDate,
                request.ComparisonStartWeek.Value,
                request.ComparisonEndWeek.Value.AddDays(6));
    }

    private static bool DateIsInRange(DateOnly date, DateOnly from, DateOnly to)
    {
        return date >= from && date <= to;
    }
}
