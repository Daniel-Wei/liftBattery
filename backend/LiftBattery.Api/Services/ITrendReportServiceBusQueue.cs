namespace LiftBattery.Api.Services;

public interface ITrendReportServiceBusQueue
{
    Task EnqueueAsync(int jobId);
}
