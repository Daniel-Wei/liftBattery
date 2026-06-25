namespace LiftBattery.Api.Services;

public interface ITrendReportQueue
{
    Task EnqueueAsync(int jobId);
}
