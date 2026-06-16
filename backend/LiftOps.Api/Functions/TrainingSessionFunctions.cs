using System.Net;
using LiftOps.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftOps.Api.Functions;

public sealed class TrainingLogFunctions
{
    private readonly ITrainingSessionService _service;

    public TrainingLogFunctions(ITrainingSessionService service)
    {
        _service = service;
    }

    [Function("GetTrainingSessions")]
    public async Task<HttpResponseData> GetTrainingSessions(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "trainingsessions")] HttpRequestData request)
    {
        var query = System.Web.HttpUtility.ParseQueryString(request.Url.Query);
        var from = DateOnly.TryParse(query["from"], out var parsedFrom)
            ? parsedFrom
            : DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
        var to = DateOnly.TryParse(query["to"], out var parsedTo)
            ? parsedTo
            : DateOnly.FromDateTime(DateTime.UtcNow);

        var logs = await _service.GetByDateRangeAsync(from, to);
        var response = request.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(logs);
        return response;
    }
}
