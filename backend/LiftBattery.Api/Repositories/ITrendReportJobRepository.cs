using LiftBattery.Api.Models;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Entities;

namespace LiftBattery.Api.Repositories;

public interface ITrendReportJobRepository
{
    Task<TrendReportJob> CreateAsync(TrendReportJob job);
    Task<string> GetOrCreateCurrentTrendReportReqDataVersionAsync(int userId);
    Task<string> BumpDataVersionAsync(int userId, DateTimeOffset updatedAtUtc);
    Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(int userId);
    Task<TrendReportJob?> GetLatestByUserIdAndFingerprintAsync(int userId, string reportFingerprint);
    Task<TrendReportJob?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<TrendReportJob> UpdateAsync(TrendReportJob job);
    Task<bool> TryStartProcessingAsync(
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);
    Task<bool> TryUpdateProgressIfCurrentProcessingAsync(
        int jobId,
        string expectedDataVersion,
        int progressPercent,
        string currentStage,
        CancellationToken cancellationToken = default);

    Task<bool> TryCompleteIfCurrentProcessingAsync(
        int jobId,
        string expectedDataVersion,
        TrendReportResultDto result,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkFailedIfCurrentProcessingAsync(
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkSupersededIfStatusAsync(
        int jobId,
        string expectedDataVersion,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkSupersededIfCurrentAsync(
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
