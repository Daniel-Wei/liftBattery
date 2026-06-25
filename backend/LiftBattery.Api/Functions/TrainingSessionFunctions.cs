using System.Globalization;
using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Options;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Options;

namespace LiftBattery.Api.Functions;

public sealed class TrainingLogFunctions
{
    private const string UserIdHeader = "X-LiftBattery-User-Id";

    private readonly ITrainingSessionService _service;
    private readonly int _defaultUserId;

    public TrainingLogFunctions(
        ITrainingSessionService service,
        IOptions<PreCheckOptions> options)
    {
        _service = service;
        _defaultUserId = options.Value.DefaultUserId;
    }

    [Function("GetTrainingDays")]
    public async Task<HttpResponseData> GetTrainingDays(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "trainingdays")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        try
        {
            var query = System.Web.HttpUtility.ParseQueryString(request.Url.Query);
            var from = ParseDate(query["from"], "from");
            var to = ParseDate(query["to"], "to");
            var days = await _service.GetByDateRangeAsync(
                GetUserId(request),
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
            var dto = await request.ReadFromJsonAsync<SaveTrainingSessionDto>(cancellationToken);

            if (dto is null)
            {
                return await WriteErrorAsync(
                    request,
                    HttpStatusCode.BadRequest,
                    "Training session body is required.",
                    cancellationToken);
            }

            var savedDay = await _service.SaveSessionAsync(GetUserId(request), dto, cancellationToken);
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
            var deleted = await _service.DeleteSessionAsync(GetUserId(request), id, cancellationToken);

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

    private int GetUserId(HttpRequestData request)
    {
        if (request.Headers.TryGetValues(UserIdHeader, out var values))
        {
            var value = values.FirstOrDefault();

            if (int.TryParse(value, out var userId) && userId > 0)
            {
                return userId;
            }
        }

        return _defaultUserId;
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
}
