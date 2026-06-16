namespace LiftOps.Api.Models;

public sealed record TrainingSession(
    string Id,
    DateOnly Date,
    int DurationMinutes,
    int SessionRpe,
    string MuscleGroup,
    string ExerciseName,
    int Sets,
    int Reps,
    decimal WeightKg,
    int? Rpe,
    int? Rir,
    string? Notes);
