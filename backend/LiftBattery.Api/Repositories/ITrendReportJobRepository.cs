using LiftBattery.Api.Models;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Entities;

namespace LiftBattery.Api.Repositories;

public sealed record CreateOrGetTrendReportJobResult(
    TrendReportJob Job,
    bool WasCreated);

public interface ITrendReportJobRepository
{
    Task<CreateOrGetTrendReportJobResult> CreateOrGetAsync(
        NewTrendReportJob newJob,
        CancellationToken cancellationToken = default);
    Task<string?> GetCurrentTrendReportReqDataVersionAsync(
        int userId,
        CancellationToken cancellationToken = default);
    Task<string> BumpDataVersionAsync(
        int userId,
        DateTimeOffset updatedAtUtc,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TrendReportJob>> GetUnstartedJobsForEnqueueRecoveryAsync(
        DateTimeOffset olderThanUtc,
        int maxCount,
        CancellationToken cancellationToken = default);
    Task<TrendReportJob?> GetByIdAsync(int userId, Guid id, CancellationToken cancellationToken = default);
    Task<bool> TryMarkCancelledIfActiveAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);
    Task<bool> TryRecordInitialEnqueueFailureAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);
    Task<bool> TryStartProcessingAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);
    Task<bool> TryMarkQueuedIfEnqueuePendingAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);

    Task<TrendReportJob?> TryBeginEnqueueRecoveryAttemptAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        int maxAttempts,
        CancellationToken cancellationToken = default);

    Task<bool> TryRecordEnqueueRecoveryFailureAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        string errorMessage,
        int maxAttempts,
        CancellationToken cancellationToken = default);

    Task<bool> TryUpdateProgressIfCurrentProcessingAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        int progressPercent,
        string currentStage,
        CancellationToken cancellationToken = default);

    Task<bool> TryCompleteIfCurrentProcessingAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkFailedIfCurrentProcessingAsync(
        int userId,
        Guid jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkSupersededIfCurrentAsync(
        int userId,
        string runId,
        Guid jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);

}

public enum TrendReportRepositoryActions
{
    StartProcessing,
    UpdateProgress,
    Complete,
    MarkFailed,
    MarkSuperseded,
    MarkCancelled,
    MarkQueued,
    MarkCompleted,
    RecordInitialEnqueueFailure,
    BeginEnqueueRecoveryAttempt,
    RecordEnqueueRecoveryFailure,
}
