using System.Globalization;
using System.Net;
using System.Text.Json;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

public sealed class PreCheckFunctions
{
    private readonly IPreCheckService _service;
    private readonly IAuthService _authService;
    private readonly AuthCookieHelper _cookieHelper;

    public PreCheckFunctions(
        IPreCheckService service,
        IAuthService authService,
        AuthCookieHelper cookieHelper)
    {
        _service = service;
        _authService = authService;
        _cookieHelper = cookieHelper;
    }

    [Function("GetTodayPreCheck")]
    public async Task<HttpResponseData> GetTodayPreCheck(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "precheck/today")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = await GetRequiredUserIdAsync(request, cancellationToken);
            if (userId is null) return await WriteUnauthorizedAsync(request, cancellationToken);

            var todayLog = await _service.GetByDateAsync(
                userId.Value,
                DateOnly.FromDateTime(DateTime.UtcNow),
                cancellationToken);
            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(todayLog, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(
                request,
                HttpStatusCode.BadRequest,
                exception.Message,
                cancellationToken);
        }
    }

    [Function("GetPreCheckByDate")]
    public async Task<HttpResponseData> GetPreCheckByDate(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "precheck")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = await GetRequiredUserIdAsync(request, cancellationToken);
            if (userId is null) return await WriteUnauthorizedAsync(request, cancellationToken);

            var date = ParseDate(GetQueryParameter(request.Url, "date"), "date");
            var log = await _service.GetByDateAsync(userId.Value, date, cancellationToken);

            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(log, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(
                request,
                HttpStatusCode.BadRequest,
                exception.Message,
                cancellationToken);
        }
    }

    [Function("GetPreChecksByDateRange")]
    public async Task<HttpResponseData> GetPreChecksByDateRange(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "prechecks")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = await GetRequiredUserIdAsync(request, cancellationToken);
            if (userId is null) return await WriteUnauthorizedAsync(request, cancellationToken);

            var from = ParseDate(GetQueryParameter(request.Url, "from"), "from");
            var to = ParseDate(GetQueryParameter(request.Url, "to"), "to");
            var logs = await _service.GetByDateRangeAsync(
                userId.Value,
                from,
                to,
                cancellationToken);
            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(logs, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(
                request,
                HttpStatusCode.BadRequest,
                exception.Message,
                cancellationToken);
        }
    }

    [Function("SavePreCheck")]
    public async Task<HttpResponseData> SavePreCheck(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "precheck")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = await GetRequiredUserIdAsync(request, cancellationToken);
            if (userId is null) return await WriteUnauthorizedAsync(request, cancellationToken);

            var dto = await request.ReadFromJsonAsync<PreCheckDto>(cancellationToken);

            if (dto is null)
            {
                return await WriteErrorAsync(
                    request,
                    HttpStatusCode.BadRequest,
                    "Pre-check body is required.",
                    cancellationToken);
            }

            var savedLog = await _service.SaveAsync(
                userId.Value,
                dto,
                cancellationToken);
            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(savedLog, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(
                request,
                HttpStatusCode.BadRequest,
                exception.Message,
                cancellationToken);
        }
        catch (Exception exception) when (ContainsJsonException(exception))
        {
            return await WriteErrorAsync(
                request,
                HttpStatusCode.BadRequest,
                "Pre-check body is invalid JSON.",
                cancellationToken);
        }
    }

    [Function("DeletePreCheck")]
    public async Task<HttpResponseData> DeletePreCheck(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "precheck/{id}")] HttpRequestData request,
        int id,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = await GetRequiredUserIdAsync(request, cancellationToken);
            if (userId is null) return await WriteUnauthorizedAsync(request, cancellationToken);

            var deletedLog = await _service.DeleteAsync(
                userId.Value,
                id,
                cancellationToken);

            if (deletedLog is null)
            {
                return await WriteErrorAsync(
                    request,
                    HttpStatusCode.NotFound,
                    "Pre-check log was not found.",
                    cancellationToken);
            }

            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(deletedLog, cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(
                request,
                HttpStatusCode.BadRequest,
                exception.Message,
                cancellationToken);
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

    private static string? GetQueryParameter(Uri uri, string name)
    {
        foreach (var part in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var separatorIndex = part.IndexOf('=');
            var key = separatorIndex < 0 ? part : part[..separatorIndex];

            if (!string.Equals(Uri.UnescapeDataString(key), name, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var value = separatorIndex < 0 ? string.Empty : part[(separatorIndex + 1)..];
            return Uri.UnescapeDataString(value.Replace('+', ' '));
        }

        return null;
    }

    private static bool ContainsJsonException(Exception exception)
    {
        return exception is JsonException
            || exception is AggregateException aggregateException
                && aggregateException.InnerExceptions.Any(ContainsJsonException);
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
