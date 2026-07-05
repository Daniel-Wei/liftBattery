using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

public sealed class WeeklyReportScheduleFunctions
{
    private readonly IWeeklyReportScheduleService _service;
    private readonly IAuthService _authService;
    private readonly AuthCookieHelper _cookieHelper;

    public WeeklyReportScheduleFunctions(
        IWeeklyReportScheduleService service,
        IAuthService authService,
        AuthCookieHelper cookieHelper)
    {
        _service = service;
        _authService = authService;
        _cookieHelper = cookieHelper;
    }

    [Function("GetWeeklyReportSchedule")]
    public async Task<HttpResponseData> GetWeeklyReportSchedule(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "users/me/weekly-report-schedule")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        var userId = await GetRequiredUserIdAsync(request, cancellationToken);
        if (userId is null) return await WriteUnauthorizedAsync(request);

        var schedule = await _service.GetForUserAsync(userId.Value, cancellationToken);
        var response = request.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(schedule, cancellationToken);
        return response;
    }

    [Function("UpdateWeeklyReportSchedule")]
    public async Task<HttpResponseData> UpdateWeeklyReportSchedule(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "users/me/weekly-report-schedule")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        var userId = await GetRequiredUserIdAsync(request, cancellationToken);
        if (userId is null) return await WriteUnauthorizedAsync(request);

        var dto = await request.ReadFromJsonAsync<UpdateWeeklyReportScheduleRequestDto>(cancellationToken);
        if (dto is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Weekly report schedule request is required.");
        }

        try
        {
            var schedule = await _service.SaveForUserAsync(userId.Value, dto, cancellationToken);
            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(schedule, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, exception.Message);
        }
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
