using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

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

    [Function("SavePreCheck")]
    public async Task<HttpResponseData> SavePreCheck(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "precheck")] HttpRequestData request)
    {
        var dto = await request.ReadFromJsonAsync<PreCheckDto>();

        if (dto is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Pre-check body is required.");
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
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Pre-check date must use yyyy-MM-dd format.");
        }
    }

    [Function("DeletePreCheck")]
    public async Task<HttpResponseData> DeletePreCheck(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "precheck/{id}")] HttpRequestData request,
        string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Pre-check id is required.");
        }

        var deletedLog = await _service.DeleteAsync(id);

        if (deletedLog is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.NotFound, "Pre-check log was not found.");
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
