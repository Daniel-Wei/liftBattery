using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;

namespace LiftBattery.Api.Services;

public sealed class TrendReportInvalidationService : ITrendReportInvalidationService
{
    private readonly ITrendReportJobRepository _jobRepository;
    private readonly ITrendReportSourceDataRepository _sourceDataRepository;

    public TrendReportInvalidationService(
        ITrendReportJobRepository jobRepository,
        ITrendReportSourceDataRepository sourceDataRepository)
    {
        _jobRepository = jobRepository;
        _sourceDataRepository = sourceDataRepository;
    }

    public async Task InvalidateForReportDataChangeAsync(
        int userId,
        DateOnly changedDate,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        // The source repository already committed the new SQL DataVersion in the
        // same SaveChanges transaction as the source CRUD. Invalidation only reads
        // that committed version and eagerly supersedes affected active jobs.
        var currentDataVersion = await _sourceDataRepository.GetCurrentDataVersionAsync(
            userId,
            cancellationToken);
        if (string.IsNullOrWhiteSpace(currentDataVersion))
        {
            throw new InvalidOperationException(
                $"Trend report source data changed for user {userId}, but no SQL DataVersion was found.");
        }
        var activeJobs = await _jobRepository.GetActiveByUserIdAsync(userId, cancellationToken);

        foreach (var job in activeJobs)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (string.Equals(job.DataVersion, currentDataVersion, StringComparison.Ordinal)
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
