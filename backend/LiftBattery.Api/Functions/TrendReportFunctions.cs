using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Functions;

public sealed class TrendReportFunctions
{
    private readonly ITrendReportService _trendReportService;
    private readonly IAuthService _authService;
    private readonly AuthCookieHelper _cookieHelper;
    private readonly ILogger<TrendReportFunctions> _logger;

    public TrendReportFunctions(
        ITrendReportService trendReportService,
        IAuthService authService,
        AuthCookieHelper cookieHelper,
        ILogger<TrendReportFunctions> logger)
    {
        _trendReportService = trendReportService;
        _authService = authService;
        _cookieHelper = cookieHelper;
        _logger = logger;
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

        try
        {
            var createTrendReportReqDTO = await requestData
                .ReadFromJsonAsync<CreateTrendReportRequestDto>(cancellationToken);

            if (createTrendReportReqDTO is null)
            {
                return await WriteErrorAsync(
                    requestData,
                    HttpStatusCode.BadRequest,
                    "请选择报告周期后重新提交。");
            }

            var trendReportDTO = await _trendReportService.SubmitAsync(
                userId.Value,
                createTrendReportReqDTO,
                cancellationToken);
            var response = requestData.CreateResponse(HttpStatusCode.Accepted);
            await response.WriteAsJsonAsync(trendReportDTO);
            return response;
        }
        // Expected request validation failure. The client can correct the dates and
        // submit again, so return 400 without exposing backend details.
        catch (ArgumentException exception)
        {
            _logger.LogWarning(
                exception,
                "Trend report creation was rejected because the request was invalid. UserId={UserId}.",
                userId.Value);

            return await WriteErrorAsync(
                requestData,
                HttpStatusCode.BadRequest,
                "所选报告周期无效，请检查后重新提交。");
        }
        // Expected no-data outcome. No job was created because the selected source
        // range was empty, so the UI can show an actionable 422 prompt.
        catch (TrendReportNoDataException exception)
        {
            _logger.LogInformation(
                exception,
                "Trend report creation found no source data. UserId={UserId}.",
                userId.Value);

            return await WriteErrorAsync(
                requestData,
                HttpStatusCode.UnprocessableEntity,
                "所选周期内没有训练或 Pre-check 数据，暂时无法生成报告。");
        }
        // Expected cross-tab product conflict. Another request with different
        // parameters owns the user's active-job lease. Log its JobId for diagnosis,
        // but return only a safe 409 prompt asking the user to wait or cancel. An
        // identical-parameter race is resolved by returning the winning job instead.
        catch (TrendReportActiveJobExistsException exception)
        {
            _logger.LogWarning(
                exception,
                "Trend report creation was blocked by an active job. UserId={UserId}, ActiveJobId={ActiveJobId}.",
                userId.Value,
                exception.ActiveJobId);

            return await WriteErrorAsync(
                requestData,
                HttpStatusCode.Conflict,
                "当前已有报告正在生成，请等待完成或先取消当前报告后再试。");
        }
        // Repository invariant failures indicate corrupt or temporarily inconsistent
        // stored state. Keep JobId, RunId, and row details in logs and expose only a
        // generic 503 response to the user.
        catch (InvalidOperationException exception)
        {
            _logger.LogError(
                exception,
                "Trend report creation failed because the stored state was invalid. UserId={UserId}.",
                userId.Value);

            return await WriteErrorAsync(
                requestData,
                HttpStatusCode.ServiceUnavailable,
                "报告暂时无法生成，请稍后重试；如果问题持续，请联系管理员。");
        }
        // Catch unexpected infrastructure or application failures without swallowing
        // request cancellation and without leaking exception details to the client.
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(
                exception,
                "Unexpected trend report creation failure. UserId={UserId}.",
                userId.Value);

            return await WriteErrorAsync(
                requestData,
                HttpStatusCode.ServiceUnavailable,
                "报告暂时无法生成，请稍后重试。");
        }
    }

    [Function("GetTrendReport")]
    public async Task<HttpResponseData> GetTrendReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "trendreports/{id:guid}")] HttpRequestData requestData,
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = await GetRequiredUserIdAsync(requestData, cancellationToken);
        if (userId is null) return await WriteUnauthorizedAsync(requestData);

        try
        {
            var job = await _trendReportService.GetByIdAsync(userId.Value, id);

            if (job is null)
            {
                return await WriteErrorAsync(
                    requestData,
                    HttpStatusCode.NotFound,
                    "这份报告不存在或已无法访问。");
            }

            var response = requestData.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(job);
            return response;
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(
                exception,
                "Failed to read trend report job. UserId={UserId}, JobId={JobId}.",
                userId.Value,
                id);

            return await WriteErrorAsync(
                requestData,
                HttpStatusCode.ServiceUnavailable,
                "暂时无法读取报告状态，请稍后重试。");
        }
    }

    [Function("CancelTrendReport")]
    public async Task<HttpResponseData> CancelTrendReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "trendreports/{id:guid}/cancel")] HttpRequestData requestData,
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = await GetRequiredUserIdAsync(requestData, cancellationToken);
        if (userId is null) return await WriteUnauthorizedAsync(requestData);

        try
        {
            var job = await _trendReportService.CancelAsync(
                userId.Value,
                id,
                cancellationToken);

            if (job is null)
            {
                return await WriteErrorAsync(
                    requestData,
                    HttpStatusCode.NotFound,
                    "这份报告不存在或已无法访问。");
            }

            var response = requestData.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(job);
            return response;
        }
        catch (InvalidOperationException exception)
        {
            _logger.LogError(
                exception,
                "Trend report cancellation failed because the job kept changing. UserId={UserId}, JobId={JobId}.",
                userId.Value,
                id);

            return await WriteErrorAsync(
                requestData,
                HttpStatusCode.ServiceUnavailable,
                "暂时无法取消这份报告，请稍后重试。");
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(
                exception,
                "Unexpected trend report cancellation failure. UserId={UserId}, JobId={JobId}.",
                userId.Value,
                id);

            return await WriteErrorAsync(
                requestData,
                HttpStatusCode.ServiceUnavailable,
                "暂时无法取消这份报告，请稍后重试。");
        }
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
