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

    public async Task InvalidateForTrainingDataChangeAsync(
        int userId,
        DateOnly changedDate,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var now = DateTimeOffset.UtcNow;
        var newDataVersion = await _jobRepository.BumpDataVersionAsync(userId, now, cancellationToken);
        var activeJobs = await _jobRepository.GetActiveByUserIdAsync(userId, cancellationToken);

        foreach (var job in activeJobs)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (string.Equals(job.DataVersion, newDataVersion, StringComparison.Ordinal)
                || !RequestContainsDate(job.Request, changedDate))
            {
                continue;
            }

            var outdatedStage = $"训练数据已在 {changedDate:yyyy-MM-dd} 更新，请重新生成报告。";

            if (job.Status == TrendReportJobStatuses.Queued)
            {
                await _jobRepository.UpdateAsync(job with
                {
                    Status = TrendReportJobStatuses.Superseded,
                    ProgressPercent = 100,
                    CurrentStage = outdatedStage,
                    ErrorMessage = null,
                    CompletedAtUtc = now,
                    UpdatedAtUtc = now,
                }, cancellationToken);
                continue;
            }

            if (job.Status == TrendReportJobStatuses.Processing)
            {
                await _jobRepository.UpdateAsync(job with
                {
                    Status = TrendReportJobStatuses.CancelRequested,
                    CurrentStage = $"训练数据已在 {changedDate:yyyy-MM-dd} 更新，正在停止旧报告，请重新生成报告。",
                    ErrorMessage = null,
                    UpdatedAtUtc = now,
                }, cancellationToken);
            }
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
