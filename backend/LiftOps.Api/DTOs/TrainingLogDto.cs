namespace LiftOps.Api.DTOs;

public sealed record TrainingLogDto(
    string? Id,
    string Date,
    string MuscleGroup,
    string ExerciseName,
    int Sets,
    int Reps,
    decimal Weight,
    int? Rir,
    string? Notes);
