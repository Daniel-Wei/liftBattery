using System.Net;
using LiftOps.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftOps.Api.Functions;

public sealed class PreCheckFunctions
{
    private readonly IPreCheckService _service;

    public PreCheckFunctions(IPreCheckService service)
    {
        _service = service;
    }

    [Function("GetTodayPreCheck")]
    public async Task<HttpResponseData> GetTodayPreCheck(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "precheck/today")] HttpRequestData request)
    {
        var todayLog = await _service.GetTodayAsync();
        var response = request.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(todayLog);
        return response;
    }
}
