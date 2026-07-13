using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

public sealed class TrendReportFunctions
{
    private readonly ITrendReportService _trendReportService;
    private readonly IAuthService _authService;
    private readonly AuthCookieHelper _cookieHelper;

    public TrendReportFunctions(
        ITrendReportService trendReportService,
        IAuthService authService,
        AuthCookieHelper cookieHelper)
    {
        _trendReportService = trendReportService;
        _authService = authService;
        _cookieHelper = cookieHelper;
    }

    // Passes the request DTO to the service to submit a durable background report job.
    // Returns 202 with the initial job state after enqueueing; the report is calculated later.
    [Function("CreateTrendReport")]
    public async Task<HttpResponseData> CreateTrendReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "trendreports")] HttpRequestData requestData,
        CancellationToken cancellationToken)
    {
        var userId = await GetRequiredUserIdAsync(requestData, cancellationToken);
        if (userId is null) return await WriteUnauthorizedAsync(requestData);

        var createTrendReportReqDTO = await requestData.ReadFromJsonAsync<CreateTrendReportRequestDto>(cancellationToken);

        if (createTrendReportReqDTO is null)
        {
            return await WriteErrorAsync(requestData, HttpStatusCode.BadRequest, "Trend report request is required.");
        }

        try
        {
            var trendReportDTO = await _trendReportService.SubmitAsync(
                userId.Value,
                createTrendReportReqDTO,
                cancellationToken);
            var response = requestData.CreateResponse(HttpStatusCode.Accepted);
            await response.WriteAsJsonAsync(trendReportDTO);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(requestData, HttpStatusCode.BadRequest, exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return await WriteErrorAsync(requestData, HttpStatusCode.ServiceUnavailable, exception.Message);
        }
    }

    [Function("GetTrendReport")]
    public async Task<HttpResponseData> GetTrendReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "trendreports/{id}")] HttpRequestData requestData,
        int id,
        CancellationToken cancellationToken)
    {
        var userId = await GetRequiredUserIdAsync(requestData, cancellationToken);
        if (userId is null) return await WriteUnauthorizedAsync(requestData);

        var job = await _trendReportService.GetByIdAsync(userId.Value, id);

        if (job is null)
        {
            return await WriteErrorAsync(requestData, HttpStatusCode.NotFound, "Trend report job was not found.");
        }

        var response = requestData.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(job);
        return response;
    }

    private static async Task<HttpResponseData> WriteErrorAsync(
        HttpRequestData requestData,
        HttpStatusCode statusCode,
        string message)
    {
        var response = requestData.CreateResponse(statusCode);
        await response.WriteAsJsonAsync(new { message });
        return response;
    }

    private Task<int?> GetRequiredUserIdAsync(
        HttpRequestData requestData,
        CancellationToken cancellationToken)
    {
        return _authService.GetCurrentUserIdAsync(
            _cookieHelper.ReadSessionToken(requestData),
            cancellationToken);
    }

    private static Task<HttpResponseData> WriteUnauthorizedAsync(HttpRequestData requestData)
    {
        return WriteErrorAsync(
            requestData,
            HttpStatusCode.Unauthorized,
            "Authentication is required.");
    }
}
