using System.Globalization;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Mapping;

public static class TrainingMapping
{
    public static TrainingDayDto ToDto(TrainingDayModel day)
    {
        return new TrainingDayDto(
            day.Id,
            day.UserId,
            day.Date.ToString("yyyy-MM-dd"),
            day.Sessions.Select(ToDto).ToList(),
            day.CreatedAtUtc.ToString("O"),
            day.UpdatedAtUtc.ToString("O"));
    }

    public static TrainingSessionModel ToModel(SaveTrainingSessionDto dto, DateTimeOffset now)
    {
        if (!TimeOnly.TryParseExact(
            dto.StartTime,
            new[] { "HH:mm", "HH:mm:ss" },
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var startTime))
        {
            throw new ArgumentException("Start time must use HH:mm format.");
        }

        return new TrainingSessionModel(
            Guid.NewGuid().ToString("N"),
            startTime,
            dto.DurationMinutes,
            dto.SessionRpe,
            dto.Exercises.Select(exercise => ToModel(exercise, now)).ToList(),
            now,
            now);
    }

    public static TrainingSessionDto ToDto(TrainingSessionModel session)
    {
        return new TrainingSessionDto(
            session.Id,
            session.TrainingDayId,
            session.StartTime.ToString("HH:mm", CultureInfo.InvariantCulture),
            session.DurationMinutes,
            session.SessionRpe,
            session.Exercises.Select(ToDto).ToList(),
            session.CreatedAtUtc.ToString("O"),
            session.UpdatedAtUtc.ToString("O"));
    }

    private static TrainingExerciseDto ToDto(TrainingExerciseModel exercise)
    {
        return new TrainingExerciseDto(
            exercise.Id,
            exercise.TrainingSessionId,
            exercise.ExerciseOrder,
            exercise.MuscleGroup,
            exercise.ExerciseName,
            exercise.Sets.Select(ToDto).ToList(),
            exercise.CreatedAtUtc.ToString("O"),
            exercise.UpdatedAtUtc.ToString("O"));
    }

    private static TrainingSetDto ToDto(TrainingSetModel set)
    {
        return new TrainingSetDto(
            set.Id,
            set.TrainingExerciseId,
            set.SetOrder,
            set.Reps,
            set.WeightKg,
            set.Rpe,
            set.Rir,
            set.IsWarmup,
            set.CreatedAtUtc.ToString("O"),
            set.UpdatedAtUtc.ToString("O"));
    }

    private static TrainingExerciseModel ToModel(TrainingExerciseDto dto, DateTimeOffset now)
    {
        return new TrainingExercise(
            dto.Id ?? Guid.NewGuid().ToString("N"),
            dto.MuscleGroup,
            dto.ExerciseName,
            dto.Sets.Select(set => ToModel(set, now)).ToList(),
            TryParseDateTimeOffset(dto.CreatedAtUtc) ?? now,
            now);
    }

    private static TrainingSetModel ToModel(TrainingSetDto dto, DateTimeOffset now)
    {
        return new TrainingSetModel(
            dto.Id ?? Guid.NewGuid().ToString("N"),
            dto.SetOrder,
            dto.Reps,
            dto.WeightKg,
            dto.Rpe,
            dto.Rir,
            dto.IsWarmup,
            TryParseDateTimeOffset(dto.CreatedAtUtc) ?? now,
            now);
    }

    private static DateTimeOffset? TryParseDateTimeOffset(string? value)
    {
        return DateTimeOffset.TryParse(value, out var dateTimeOffset)
            ? dateTimeOffset
            : null;
    }
}
