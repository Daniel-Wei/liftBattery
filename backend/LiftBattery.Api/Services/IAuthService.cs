using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface IAuthService
{
    Task<(AuthUserDto User, string SessionToken, DateTimeOffset ExpiresAtUtc)> RegisterAsync(
        RegisterRequestDto request,
        CancellationToken cancellationToken = default);

    Task<(AuthUserDto User, string SessionToken, DateTimeOffset ExpiresAtUtc)> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default);

    Task<AuthUserDto?> GetCurrentUserAsync(
        string? sessionToken,
        CancellationToken cancellationToken = default);

    Task<int?> GetCurrentUserIdAsync(
        string? sessionToken,
        CancellationToken cancellationToken = default);

    Task<AuthUserDto?> UpdateProfileAsync(
        string? sessionToken,
        UpdateProfileRequestDto request,
        CancellationToken cancellationToken = default);

    Task LogoutAsync(
        string? sessionToken,
        CancellationToken cancellationToken = default);
}
