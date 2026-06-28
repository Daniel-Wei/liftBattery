using System.Globalization;
using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

public sealed class TrainingLogFunctions
{
    private readonly ITrainingSessionService _service;
    private readonly IAuthService _authService;
    private readonly AuthCookieHelper _cookieHelper;

    public TrainingLogFunctions(
        ITrainingSessionService service,
        IAuthService authService,
        AuthCookieHelper cookieHelper)
    {
        _service = service;
        _authService = authService;
        _cookieHelper = cookieHelper;
    }

    [Function("GetTrainingDays")]
    public async Task<HttpResponseData> GetTrainingDays(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "trainingdays")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = await GetRequiredUserIdAsync(request, cancellationToken);
            if (userId is null) return await WriteUnauthorizedAsync(request, cancellationToken);

            var query = System.Web.HttpUtility.ParseQueryString(request.Url.Query);
            var from = ParseDate(query["from"], "from");
            var to = ParseDate(query["to"], "to");
            var days = await _service.GetByDateRangeAsync(
                userId.Value,
                from,
                to,
                cancellationToken);
            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(days, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, exception.Message, cancellationToken);
        }
    }

    [Function("SaveTrainingSession")]
    public async Task<HttpResponseData> SaveTrainingSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "trainingdays/sessions")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = await GetRequiredUserIdAsync(request, cancellationToken);
            if (userId is null) return await WriteUnauthorizedAsync(request, cancellationToken);

            var dto = await request.ReadFromJsonAsync<SaveTrainingSessionDto>(cancellationToken);

            if (dto is null)
            {
                return await WriteErrorAsync(
                    request,
                    HttpStatusCode.BadRequest,
                    "Training session body is required.",
                    cancellationToken);
            }

            var savedDay = await _service.SaveSessionAsync(userId.Value, dto, cancellationToken);
            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(savedDay, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, exception.Message, cancellationToken);
        }
    }

    [Function("DeleteTrainingSession")]
    public async Task<HttpResponseData> DeleteTrainingSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "trainingsessions/{id}")] HttpRequestData request,
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = await GetRequiredUserIdAsync(request, cancellationToken);
            if (userId is null) return await WriteUnauthorizedAsync(request, cancellationToken);

            var deleted = await _service.DeleteSessionAsync(userId.Value, id, cancellationToken);

            if (deleted is null)
            {
                return await WriteErrorAsync(
                    request,
                    HttpStatusCode.NotFound,
                    "Training session was not found.",
                    cancellationToken);
            }

            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(deleted, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, exception.Message, cancellationToken);
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

    private static DateOnly ParseDate(string? value, string name)
    {
        if (!DateOnly.TryParseExact(
            value,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var date))
        {
            throw new ArgumentException($"{name} must use yyyy-MM-dd format.");
        }

        return date;
    }

    private static async Task<HttpResponseData> WriteErrorAsync(
        HttpRequestData request,
        HttpStatusCode statusCode,
        string message,
        CancellationToken cancellationToken)
    {
        var response = request.CreateResponse(statusCode);
        await response.WriteAsJsonAsync(new { message }, cancellationToken);
        return response;
    }

    private static Task<HttpResponseData> WriteUnauthorizedAsync(
        HttpRequestData request,
        CancellationToken cancellationToken)
    {
        return WriteErrorAsync(
            request,
            HttpStatusCode.Unauthorized,
            "Authentication is required.",
            cancellationToken);
    }
}
