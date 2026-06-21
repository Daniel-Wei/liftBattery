namespace LiftBattery.Api.DTOs;

public sealed record TrainingSetEntryDto(
    string? Id,
    string ExerciseName,
    string MuscleGroup,
    int Reps,
    decimal WeightKg,
    decimal? Rpe,
    decimal? Rir,
    bool IsWarmup);

public sealed record TrainingSessionDto(
    string? Id,
    string Date,
    int DurationMinutes,
    decimal SessionRpe,
    IReadOnlyList<TrainingSetEntryDto> Sets,
    string? CreatedAt,
    string? UpdatedAt);
