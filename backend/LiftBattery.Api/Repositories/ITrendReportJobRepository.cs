using LiftBattery.Api.Models;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Entities;

namespace LiftBattery.Api.Repositories;

public interface ITrendReportJobRepository
{
    Task<TrendReportJob> CreateAsync(TrendReportJob job, CancellationToken cancellationToken = default);
    Task<string> GetOrCreateCurrentTrendReportReqDataVersionAsync(
        int userId,
        CancellationToken cancellationToken = default);
    Task<string> BumpDataVersionAsync(
        int userId,
        DateTimeOffset updatedAtUtc,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default);
    Task<TrendReportJob?> GetLatestByUserIdAndFingerprintAsync(int userId, string dataVersion,
        string reportFingerprint, CancellationToken cancellationToken = default);
    Task<TrendReportJob?> GetByIdAsync(int userId, int id, CancellationToken cancellationToken = default);
    Task<TrendReportJob> UpdateAsync(TrendReportJob job, CancellationToken cancellationToken = default);
    Task<bool> TryStartProcessingAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);
    Task<bool> TryUpdateProgressIfCurrentProcessingAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        int progressPercent,
        string currentStage,
        CancellationToken cancellationToken = default);

    Task<bool> TryCompleteIfCurrentProcessingAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkFailedIfCurrentProcessingAsync(
        int userId,
        int jobId,
        string expectedRunId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkSupersededIfCancelRequestedAsync(
        int userId,
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkSupersededIfCurrentAsync(
        int userId,
        int jobId,
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
    MarkCompleted,
}
