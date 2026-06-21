using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

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

    [Function("SaveTrainingSession")]
    public async Task<HttpResponseData> SaveTrainingSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "trainingsessions")] HttpRequestData request)
    {
        var dto = await request.ReadFromJsonAsync<TrainingSessionDto>();

        if (dto is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Training session body is required.");
        }

        try
        {
            var savedLog = await _service.SaveAsync(dto);
            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(savedLog);
            return response;
        }
        catch (FormatException)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Training session date must use yyyy-MM-dd format.");
        }
    }

    [Function("DeleteTrainingSession")]
    public async Task<HttpResponseData> DeleteTrainingSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "trainingsessions/{id}")] HttpRequestData request,
        string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Training session id is required.");
        }

        var deletedLog = await _service.DeleteAsync(id);

        if (deletedLog is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.NotFound, "Training session was not found.");
        }

        var response = request.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(deletedLog);
        return response;
    }

    private static async Task<HttpResponseData> WriteErrorAsync(
        HttpRequestData request,
        HttpStatusCode statusCode,
        string message)
    {
        var response = request.CreateResponse(statusCode);
        await response.WriteAsJsonAsync(new { message });
        return response;
    }
}
