using LiftBattery.Api.Models;

namespace LiftBattery.Api.Repositories;

public interface ITrendReportJobRepository
{
    Task<TrendReportJob> CreateAsync(TrendReportJob job);
    Task<TrendReportJob?> GetByIdAsync(string id);
    Task<TrendReportJob?> TryStartProcessingAsync(string id, DateTimeOffset startedAtUtc);
    Task<TrendReportJob> UpdateAsync(TrendReportJob job);
}
