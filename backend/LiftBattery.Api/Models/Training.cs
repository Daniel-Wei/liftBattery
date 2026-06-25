namespace LiftBattery.Api.Models;

public sealed record TrainingSetModel(
    int Id,
    int TrainingExerciseId,
    int SetOrder,
    int Reps,
    decimal WeightKg,
    decimal? Rpe,
    decimal? Rir,
    bool IsWarmup,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record TrainingExerciseModel(
    int Id,
    int TrainingSessionId,
    string MuscleGroup,
    string ExerciseName,
    int ExerciseOrder,
    IReadOnlyList<TrainingSetModel> Sets,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record TrainingSessionModel(
    int Id,
    int TrainingDayId,
    TimeOnly StartTime,
    int DurationMinutes,
    decimal SessionRpe,
    IReadOnlyList<TrainingExerciseModel> Exercises,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record TrainingDayModel(
    int Id,
    int UserId,
    DateOnly Date,
    IReadOnlyList<TrainingSessionModel> Sessions,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);
