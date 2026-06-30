using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface ITrendReportJobRepository
{
    Task<TrendReportJob> CreateAsync(TrendReportJob job);
    Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(int userId);
    Task<TrendReportJob?> GetByIdAsync(int id);
    Task<TrendReportJob?> TryStartProcessingAsync(int id, DateTimeOffset startedAtUtc);
    Task<TrendReportJob> UpdateAsync(TrendReportJob job);
}
