using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

public sealed class TrendReportFunctions
{
    private readonly ITrendReportService _service;
    private readonly IAuthService _authService;
    private readonly AuthCookieHelper _cookieHelper;

    public TrendReportFunctions(
        ITrendReportService service,
        IAuthService authService,
        AuthCookieHelper cookieHelper)
    {
        _service = service;
        _authService = authService;
        _cookieHelper = cookieHelper;
    }

    // Passes the request DTO to the service to persist and enqueue a report job.
    // Returns 202 with the initial job state after enqueueing; the report is calculated later.
    [Function("CreateTrendReport")]
    public async Task<HttpResponseData> CreateTrendReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "trendreports")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        var userId = await GetRequiredUserIdAsync(request, cancellationToken);
        if (userId is null) return await WriteUnauthorizedAsync(request);

        var dto = await request.ReadFromJsonAsync<CreateTrendReportRequestDto>(cancellationToken);

        if (dto is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Trend report request is required.");
        }

        try
        {
            var job = await _service.CreateAsync(userId.Value, dto);
            var response = request.CreateResponse(HttpStatusCode.Accepted);
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
        int id,
        CancellationToken cancellationToken)
    {
        var userId = await GetRequiredUserIdAsync(request, cancellationToken);
        if (userId is null) return await WriteUnauthorizedAsync(request);

        var job = await _service.GetByIdAsync(userId.Value, id);

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

    private Task<int?> GetRequiredUserIdAsync(
        HttpRequestData request,
        CancellationToken cancellationToken)
    {
        return _authService.GetCurrentUserIdAsync(
            _cookieHelper.ReadSessionToken(request),
            cancellationToken);
    }

    private static Task<HttpResponseData> WriteUnauthorizedAsync(HttpRequestData request)
    {
        return WriteErrorAsync(
            request,
            HttpStatusCode.Unauthorized,
            "Authentication is required.");
    }
}
