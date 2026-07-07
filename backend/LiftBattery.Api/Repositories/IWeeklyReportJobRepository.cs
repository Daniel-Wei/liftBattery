using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface IWeeklyReportJobRepository
{
    Task<WeeklyReportJob> CreateAsync(
        WeeklyReportJob job,
        CancellationToken cancellationToken = default);

    Task<WeeklyReportJob?> GetByIdAsync(
        int userId,
        int id,
        CancellationToken cancellationToken = default);

    Task<WeeklyReportJob?> GetLatestByUserIdAndRunKeyAsync(
        int userId,
        string scheduleId,
        string runKey,
        CancellationToken cancellationToken = default);

    Task<bool> TryStartProcessingAsync(
        int userId,
        int jobId,
        string runKey,
        CancellationToken cancellationToken = default);

    Task<bool> TryCompleteIfCurrentProcessingAsync(
        int userId,
        int jobId,
        string runKey,
        TrendReportResultDto result,
        string blobName,
        CancellationToken cancellationToken = default);

    Task<bool> TryMarkFailedIfCurrentProcessingAsync(
        int userId,
        int jobId,
        string runKey,
        string errorMessage,
        CancellationToken cancellationToken = default);
}
