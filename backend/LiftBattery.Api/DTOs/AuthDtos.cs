namespace LiftBattery.Api.DTOs;

public sealed record AuthUserDto(
    int Id,
    string DisplayName,
    string Email,
    string? TrainingGoal,
    int WeeklyTargetTrainingDays,
    string PreferredUnit,
    DateTimeOffset CreatedAtUtc);

public sealed record RegisterRequestDto(
    string DisplayName,
    string Email,
    string Password,
    string ConfirmPassword,
    string BetaInviteCode);

public sealed record LoginRequestDto(
    string Email,
    string Password);

public sealed record UpdateProfileRequestDto(
    string DisplayName,
    string? TrainingGoal,
    int WeeklyTargetTrainingDays,
    string PreferredUnit);

public sealed record AuthResultDto(AuthUserDto User);
