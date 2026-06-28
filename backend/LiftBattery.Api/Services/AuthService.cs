using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using LiftBattery.Api.Data;
using LiftBattery.Api.Data.Entities;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LiftBattery.Api.Services;

public sealed class AuthService : IAuthService
{
    private readonly LiftBatteryDbContext _dbContext;
    private readonly PasswordHashingService _passwordHashingService;
    private readonly AuthOptions _options;
    private readonly TimeProvider _timeProvider;

    public AuthService(
        LiftBatteryDbContext dbContext,
        PasswordHashingService passwordHashingService,
        IOptions<AuthOptions> options,
        TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _passwordHashingService = passwordHashingService;
        _options = options.Value;
        _timeProvider = timeProvider;
    }

    public async Task<(AuthUserDto User, string SessionToken, DateTimeOffset ExpiresAtUtc)> RegisterAsync(
        RegisterRequestDto request,
        CancellationToken cancellationToken = default)
    {
        ValidateInviteCode(request.BetaInviteCode);
        var displayName = NormalizeDisplayName(request.DisplayName);
        var email = NormalizeEmail(request.Email);
        ValidatePasswordPair(request.Password, request.ConfirmPassword);

        var existing = await _dbContext.Users
            .AsNoTracking()
            .AnyAsync(user => user.NormalizedEmail == email.Normalized, cancellationToken);

        if (existing)
        {
            throw new ArgumentException("This email cannot be registered.");
        }

        var now = _timeProvider.GetUtcNow();
        var user = new User
        {
            DisplayName = displayName,
            Email = email.Display,
            NormalizedEmail = email.Normalized,
            PasswordHash = _passwordHashingService.HashPassword(request.Password),
            WeeklyTargetTrainingDays = 4,
            PreferredUnit = "kg",
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // TODO: Before public launch, add verified email ownership and password recovery flows.
        var session = await CreateSessionAsync(user.Id, cancellationToken);
        return (ToDto(user), session.Token, session.ExpiresAtUtc);
    }

    public async Task<(AuthUserDto User, string SessionToken, DateTimeOffset ExpiresAtUtc)> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _dbContext.Users
            .SingleOrDefaultAsync(candidate => candidate.NormalizedEmail == email.Normalized, cancellationToken);

        if (user is null || !_passwordHashingService.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Email or password is incorrect.");
        }

        var session = await CreateSessionAsync(user.Id, cancellationToken);
        return (ToDto(user), session.Token, session.ExpiresAtUtc);
    }

    public async Task<AuthUserDto?> GetCurrentUserAsync(
        string? sessionToken,
        CancellationToken cancellationToken = default)
    {
        var session = await GetActiveSessionAsync(sessionToken, cancellationToken);
        return session?.User is null ? null : ToDto(session.User);
    }

    public async Task<int?> GetCurrentUserIdAsync(
        string? sessionToken,
        CancellationToken cancellationToken = default)
    {
        var session = await GetActiveSessionAsync(sessionToken, cancellationToken);
        return session?.UserId;
    }

    public async Task<AuthUserDto?> UpdateProfileAsync(
        string? sessionToken,
        UpdateProfileRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var session = await GetActiveSessionAsync(sessionToken, cancellationToken);

        if (session is null)
        {
            return null;
        }

        var user = session.User;
        user.DisplayName = NormalizeDisplayName(request.DisplayName);
        user.TrainingGoal = string.IsNullOrWhiteSpace(request.TrainingGoal)
            ? null
            : request.TrainingGoal.Trim();
        user.WeeklyTargetTrainingDays = request.WeeklyTargetTrainingDays;
        user.PreferredUnit = NormalizeUnit(request.PreferredUnit);
        user.UpdatedAtUtc = _timeProvider.GetUtcNow();

        if (user.WeeklyTargetTrainingDays is < 1 or > 14)
        {
            throw new ArgumentException("Weekly target training days must be between 1 and 14.");
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ToDto(user);
    }

    public async Task LogoutAsync(
        string? sessionToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sessionToken))
        {
            return;
        }

        var tokenHash = HashSessionToken(sessionToken);
        var session = await _dbContext.AuthSessions
            .SingleOrDefaultAsync(candidate => candidate.TokenHash == tokenHash, cancellationToken);

        if (session is null || session.RevokedAtUtc is not null)
        {
            return;
        }

        session.RevokedAtUtc = _timeProvider.GetUtcNow();
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<AuthSessionToken> CreateSessionAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var now = _timeProvider.GetUtcNow();
        var sessionDays = Math.Clamp(_options.SessionDays, 1, 60);
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var entity = new AuthSession
        {
            UserId = userId,
            TokenHash = HashSessionToken(token),
            CreatedAtUtc = now,
            ExpiresAtUtc = now.AddDays(sessionDays),
            User = null!,
        };

        _dbContext.AuthSessions.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return new AuthSessionToken(token, entity.ExpiresAtUtc);
    }

    private async Task<AuthSession?> GetActiveSessionAsync(
        string? sessionToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sessionToken))
        {
            return null;
        }

        var now = _timeProvider.GetUtcNow();
        var tokenHash = HashSessionToken(sessionToken);
        return await _dbContext.AuthSessions
            .Include(session => session.User)
            .SingleOrDefaultAsync(
                session => session.TokenHash == tokenHash
                    && session.RevokedAtUtc == null
                    && session.ExpiresAtUtc > now,
                cancellationToken);
    }

    private void ValidateInviteCode(string inviteCode)
    {
        if (string.IsNullOrWhiteSpace(_options.BetaInviteCode))
        {
            throw new InvalidOperationException("Beta registration is not configured.");
        }

        if (!string.Equals(inviteCode.Trim(), _options.BetaInviteCode, StringComparison.Ordinal))
        {
            throw new ArgumentException("Beta invite code is invalid.");
        }
    }

    private static string NormalizeDisplayName(string displayName)
    {
        var normalized = displayName.Trim();

        if (normalized.Length is < 2 or > 80)
        {
            throw new ArgumentException("Display name must be between 2 and 80 characters.");
        }

        return normalized;
    }

    private static (string Display, string Normalized) NormalizeEmail(string email)
    {
        var display = email.Trim();
        var validator = new EmailAddressAttribute();

        if (!validator.IsValid(display))
        {
            throw new ArgumentException("Email format is invalid.");
        }

        return (display, display.ToUpperInvariant());
    }

    private static void ValidatePasswordPair(string password, string confirmPassword)
    {
        if (!string.Equals(password, confirmPassword, StringComparison.Ordinal))
        {
            throw new ArgumentException("Password and confirmation password do not match.");
        }

        if (password.Length < 8)
        {
            throw new ArgumentException("Password must be at least 8 characters.");
        }
    }

    private static string NormalizeUnit(string preferredUnit)
    {
        var normalized = preferredUnit.Trim().ToLowerInvariant();

        if (normalized is not ("kg" or "lb"))
        {
            throw new ArgumentException("Preferred unit must be kg or lb.");
        }

        return normalized;
    }

    private static string HashSessionToken(string sessionToken)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(sessionToken));
        return Convert.ToHexString(hash);
    }

    private static AuthUserDto ToDto(User user)
    {
        return new AuthUserDto(
            user.Id,
            user.DisplayName,
            user.Email,
            user.TrainingGoal,
            user.WeeklyTargetTrainingDays,
            user.PreferredUnit,
            user.CreatedAtUtc);
    }

    private sealed record AuthSessionToken(string Token, DateTimeOffset ExpiresAtUtc);
}
