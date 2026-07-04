using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface ITrendReportJobRepository
{
    Task<TrendReportJob> CreateAsync(TrendReportJob job);
    Task<string> GetOrCreateCurrentDataVersionAsync(int userId);
    Task<string> BumpDataVersionAsync(int userId, DateTimeOffset updatedAtUtc);
    Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(int userId);
    Task<TrendReportJob?> GetLatestByUserIdAndFingerprintAsync(int userId, string reportFingerprint);
    Task<TrendReportJob?> GetByIdAsync(int id);
    Task<TrendReportJob?> TryStartProcessingAsync(int id, DateTimeOffset startedAtUtc);
    Task<TrendReportJob> UpdateAsync(TrendReportJob job);
}
