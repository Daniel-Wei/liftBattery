namespace LiftBattery.Api.DTOs;

public sealed record TrainingSetDto(
    string? Id,
    string? TrainingExerciseId,
    int SetOrder,
    int Reps,
    decimal WeightKg,
    decimal? Rpe,
    decimal? Rir,
    bool IsWarmup,
    string? CreatedAtUtc,
    string? UpdatedAtUtc);

public sealed record TrainingExerciseDto(
    string? Id,
    string? TrainingSessionId,
    int ExerciseOrder,
    string MuscleGroup,
    string ExerciseName,
    IReadOnlyList<TrainingSetDto> Sets,
    string? CreatedAtUtc,
    string? UpdatedAtUtc);

public sealed record TrainingSessionDto(
    string? Id,
    string? TrainingDayId,
    string StartTime,
    int DurationMinutes,
    decimal SessionRpe,
    IReadOnlyList<TrainingExerciseDto> Exercises,
    string? CreatedAtUtc,
    string? UpdatedAtUtc);

public sealed record TrainingDayDto(
    string Id,
    string UserId,
    string Date,
    IReadOnlyList<TrainingSessionDto> Sessions,
    string CreatedAtUtc,
    string UpdatedAtUtc);

public sealed record SaveTrainingSessionDto(
    string Date,
    string StartTime,
    int DurationMinutes,
    decimal SessionRpe,
    IReadOnlyList<TrainingExerciseDto> Exercises);
