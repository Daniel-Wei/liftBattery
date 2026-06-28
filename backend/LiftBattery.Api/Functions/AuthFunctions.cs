using System.Net;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace LiftBattery.Api.Functions;

public sealed class AuthFunctions
{
    private readonly IAuthService _authService;
    private readonly AuthCookieHelper _cookieHelper;

    public AuthFunctions(IAuthService authService, AuthCookieHelper cookieHelper)
    {
        _authService = authService;
        _cookieHelper = cookieHelper;
    }

    [Function("Register")]
    public async Task<HttpResponseData> Register(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/register")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        var dto = await request.ReadFromJsonAsync<RegisterRequestDto>(cancellationToken);

        if (dto is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Registration body is required.", cancellationToken);
        }

        try
        {
            var result = await _authService.RegisterAsync(dto, cancellationToken);
            var response = request.CreateResponse(HttpStatusCode.OK);
            _cookieHelper.AppendSignInCookie(response, result.SessionToken, result.ExpiresAtUtc);
            await response.WriteAsJsonAsync(new AuthResultDto(result.User), cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, exception.Message, cancellationToken);
        }
        catch (InvalidOperationException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.ServiceUnavailable, exception.Message, cancellationToken);
        }
    }

    [Function("Login")]
    public async Task<HttpResponseData> Login(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/login")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        var dto = await request.ReadFromJsonAsync<LoginRequestDto>(cancellationToken);

        if (dto is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Login body is required.", cancellationToken);
        }

        try
        {
            var result = await _authService.LoginAsync(dto, cancellationToken);
            var response = request.CreateResponse(HttpStatusCode.OK);
            _cookieHelper.AppendSignInCookie(response, result.SessionToken, result.ExpiresAtUtc);
            await response.WriteAsJsonAsync(new AuthResultDto(result.User), cancellationToken);
            return response;
        }
        catch (UnauthorizedAccessException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.Unauthorized, exception.Message, cancellationToken);
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, exception.Message, cancellationToken);
        }
    }

    [Function("Logout")]
    public async Task<HttpResponseData> Logout(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/logout")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        await _authService.LogoutAsync(_cookieHelper.ReadSessionToken(request), cancellationToken);
        var response = request.CreateResponse(HttpStatusCode.NoContent);
        _cookieHelper.AppendSignOutCookie(response);
        return response;
    }

    [Function("Me")]
    public async Task<HttpResponseData> Me(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/me")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        var user = await _authService.GetCurrentUserAsync(
            _cookieHelper.ReadSessionToken(request),
            cancellationToken);

        if (user is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.Unauthorized, "Authentication is required.", cancellationToken);
        }

        var response = request.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new AuthResultDto(user), cancellationToken);
        return response;
    }

    [Function("UpdateProfile")]
    public async Task<HttpResponseData> UpdateProfile(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "users/me")] HttpRequestData request,
        CancellationToken cancellationToken)
    {
        var dto = await request.ReadFromJsonAsync<UpdateProfileRequestDto>(cancellationToken);

        if (dto is null)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, "Profile body is required.", cancellationToken);
        }

        try
        {
            var user = await _authService.UpdateProfileAsync(
                _cookieHelper.ReadSessionToken(request),
                dto,
                cancellationToken);

            if (user is null)
            {
                return await WriteErrorAsync(request, HttpStatusCode.Unauthorized, "Authentication is required.", cancellationToken);
            }

            var response = request.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new AuthResultDto(user), cancellationToken);
            return response;
        }
        catch (ArgumentException exception)
        {
            return await WriteErrorAsync(request, HttpStatusCode.BadRequest, exception.Message, cancellationToken);
        }
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
