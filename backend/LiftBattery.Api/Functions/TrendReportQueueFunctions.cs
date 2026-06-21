using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;

namespace LiftBattery.Api.Functions;

public sealed class TrendReportQueueFunctions
{
    private readonly ITrendReportService _service;

    public TrendReportQueueFunctions(ITrendReportService service)
    {
        _service = service;
    }

    // Azure Functions invokes this when a queue message is available, including redeliveries.
    // The message body is the job ID used to start background report processing.
    [Function("ProcessTrendReportJob")]
    public Task ProcessTrendReportJob(
        [ServiceBusTrigger("%TrendReportQueueName%", Connection = "ServiceBusConnection")] string jobId)
    {
        return _service.ProcessAsync(jobId);
    }
}
