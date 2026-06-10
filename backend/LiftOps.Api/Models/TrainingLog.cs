namespace LiftOps.Api.Models;

public sealed record TrainingLog(
    string Id,
    DateOnly Date,
    string MuscleGroup,
    string ExerciseName,
    int Sets,
    int Reps,
    decimal Weight,
    int? Rir,
    string? Notes);
