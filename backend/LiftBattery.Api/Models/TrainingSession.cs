namespace LiftBattery.Api.Models;

public sealed record TrainingSetEntry(
    string Id,
    string ExerciseName,
    string MuscleGroup,
    int Reps,
    decimal WeightKg,
    decimal? Rpe,
    decimal? Rir,
    bool IsWarmup);

public sealed record TrainingSession(
    string Id,
    DateOnly Date,
    int DurationMinutes,
    decimal SessionRpe,
    IReadOnlyList<TrainingSetEntry> Sets,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
