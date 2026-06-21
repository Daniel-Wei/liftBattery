using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

public sealed class TrendReportFunctions
{
    private readonly ITrendReportService _service;

    public TrendReportFunctions(ITrendReportService service)
    {
        _service = service;
    }

    [Function("CreateTrendReport")]
    public async Task<HttpResponseData> CreateTrendReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "trendreports")] HttpRequestData request)
    {
        var dto = await request.ReadFromJsonAsync<CreateTrendReportRequestDto>();

        if (dto is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Trend report request is required.");
        }

        try
        {
            var job = await _service.CreateAsync(dto);
            var response = request.CreateResponse(HttpStatusCode.Accepted);
            response.Headers.Add("Location", $"/api/trendreports/{job.Id}");
            await response.WriteAsJsonAsync(job);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.ServiceUnavailable, exception.Message);
        }
    }

    [Function("GetTrendReport")]
    public async Task<HttpResponseData> GetTrendReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "trendreports/{id}")] HttpRequestData request,
        string id)
    {
        var job = await _service.GetByIdAsync(id);

        if (job is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.NotFound, "Trend report job was not found.");
        }

        var response = request.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(job);
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
