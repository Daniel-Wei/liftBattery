namespace LiftBattery.Api.DTOs;

public sealed record TrainingSetDto(
    int? Id,
    int? TrainingExerciseId,
    int SetOrder,
    int Reps,
    decimal WeightKg,
    decimal? Rpe,
    decimal? Rir,
    bool IsWarmup,
    string? CreatedAtUtc,
    string? UpdatedAtUtc);

public sealed record TrainingExerciseDto(
    int? Id,
    int? TrainingSessionId,
    int ExerciseOrder,
    string MuscleGroup,
    string ExerciseName,
    IReadOnlyList<TrainingSetDto> Sets,
    string? CreatedAtUtc,
    string? UpdatedAtUtc);

public sealed record TrainingSessionDto(
    int? Id,
    int? TrainingDayId,
    string StartTime,
    int DurationMinutes,
    decimal SessionRpe,
    IReadOnlyList<TrainingExerciseDto> Exercises,
    string? CreatedAtUtc,
    string? UpdatedAtUtc);

public sealed record TrainingDayDto(
    int Id,
    int UserId,
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
