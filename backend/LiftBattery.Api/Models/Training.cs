namespace LiftBattery.Api.Models;

public sealed record TrainingSetModel(
    string Id,
    string TrainingExerciseId,
    int SetOrder,
    int Reps,
    decimal WeightKg,
    decimal? Rpe,
    decimal? Rir,
    bool IsWarmup,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record TrainingExerciseModel(
    string Id,
    string TrainingSessionId,
    string MuscleGroup,
    string ExerciseName,
    int ExerciseOrder,
    IReadOnlyList<TrainingSetModel> Sets,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record TrainingSessionModel(
    string Id,
    string TrainingDayId,
    TimeOnly StartTime,
    int DurationMinutes,
    decimal SessionRpe,
    IReadOnlyList<TrainingExerciseModel> Exercises,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record TrainingDayModel(
    string Id,
    string UserId,
    DateOnly Date,
    IReadOnlyList<TrainingSessionModel> Sessions,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);
