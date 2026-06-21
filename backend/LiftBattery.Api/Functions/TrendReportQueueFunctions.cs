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

    [Function("ProcessTrendReportJob")]
    public Task ProcessTrendReportJob(
        [ServiceBusTrigger("%TrendReportQueueName%", Connection = "ServiceBusConnection")] string jobId)
    {
        return _service.ProcessAsync(jobId);
    }
}
