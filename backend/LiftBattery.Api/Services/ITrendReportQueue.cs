namespace LiftBattery.Api.Services;

public interface ITrendReportQueue
{
    Task EnqueueAsync(string jobId);
}
