using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Mapping;

public static class TrainingSessionMapping
{
    public static TrainingSessionDto ToDto(TrainingSession log)
    {
        return new TrainingSessionDto(
            log.Id,
            log.Date.ToString("yyyy-MM-dd"),
            log.DurationMinutes,
            log.SessionRpe,
            log.Sets.Select(ToDto).ToList(),
            log.CreatedAt.ToString("O"),
            log.UpdatedAt.ToString("O"));
    }

    public static TrainingSession ToModel(TrainingSessionDto dto)
    {
        var now = DateTimeOffset.UtcNow;

        return new TrainingSession(
            dto.Id ?? Guid.NewGuid().ToString("N"),
            DateOnly.Parse(dto.Date),
            dto.DurationMinutes,
            dto.SessionRpe,
            dto.Sets.Select(ToModel).ToList(),
            TryParseDateTimeOffset(dto.CreatedAt) ?? now,
            now);
    }

    private static TrainingSetEntryDto ToDto(TrainingSetEntry set)
    {
        return new TrainingSetEntryDto(
            set.Id,
            set.ExerciseName,
            set.MuscleGroup,
            set.Reps,
            set.WeightKg,
            set.Rpe,
            set.Rir,
            set.IsWarmup);
    }

    private static TrainingSetEntry ToModel(TrainingSetEntryDto dto)
    {
        return new TrainingSetEntry(
            dto.Id ?? Guid.NewGuid().ToString("N"),
            dto.ExerciseName,
            dto.MuscleGroup,
            dto.Reps,
            dto.WeightKg,
            dto.Rpe,
            dto.Rir,
            dto.IsWarmup);
    }

    private static DateTimeOffset? TryParseDateTimeOffset(string? value)
    {
        return DateTimeOffset.TryParse(value, out var dateTimeOffset)
            ? dateTimeOffset
            : null;
    }
}
