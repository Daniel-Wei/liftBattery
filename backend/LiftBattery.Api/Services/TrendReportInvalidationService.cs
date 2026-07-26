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
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        // The source repository already committed the new SQL DataVersion in the
        // same SaveChanges transaction as the source CRUD. Invalidation only reads
        // that committed version. DataVersion is global per user, so every active job
        // captured from an older version is superseded, regardless of whether the
        // changed row's date falls inside that job's requested range. The worker uses
        // the same global rule before processing and completion.
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

            if (string.Equals(job.DataVersion, currentDataVersion, StringComparison.Ordinal))
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
}
