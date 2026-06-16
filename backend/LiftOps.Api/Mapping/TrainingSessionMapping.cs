using LiftOps.Api.DTOs;
using LiftOps.Api.Models;

namespace LiftOps.Api.Mapping;

public static class TrainingSessionMapping
{
    public static TrainingSessionDto ToDto(TrainingSession log)
    {
        return new TrainingSessionDto(
            log.Id,
            log.Date.ToString("yyyy-MM-dd"),
            log.DurationMinutes,
            log.SessionRpe,
            log.MuscleGroup,
            log.ExerciseName,
            log.Sets,
            log.Reps,
            log.WeightKg,
            log.Rpe,
            log.Rir,
            log.Notes);
    }

    public static TrainingSession ToModel(TrainingSessionDto dto)
    {
        return new TrainingSession(
            dto.Id ?? Guid.NewGuid().ToString("N"),
            DateOnly.Parse(dto.Date),
            dto.DurationMinutes,
            dto.SessionRpe,
            dto.MuscleGroup,
            dto.ExerciseName,
            dto.Sets,
            dto.Reps,
            dto.WeightKg,
            dto.Rpe,
            dto.Rir,
            dto.Notes);
    }
}
