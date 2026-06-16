namespace LiftOps.Api.DTOs;

public sealed record TrainingSessionDto(
    string? Id,
    string Date,
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
