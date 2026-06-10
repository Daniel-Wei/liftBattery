using LiftOps.Api.DTOs;
using LiftOps.Api.Models;

namespace LiftOps.Api.Mapping;

public static class TrainingLogMapping
{
    public static TrainingLogDto ToDto(TrainingLog log)
    {
        return new TrainingLogDto(
            log.Id,
            log.Date.ToString("yyyy-MM-dd"),
            log.MuscleGroup,
            log.ExerciseName,
            log.Sets,
            log.Reps,
            log.Weight,
            log.Rir,
            log.Notes);
    }

    public static TrainingLog ToModel(TrainingLogDto dto)
    {
        return new TrainingLog(
            dto.Id ?? Guid.NewGuid().ToString("N"),
            DateOnly.Parse(dto.Date),
            dto.MuscleGroup,
            dto.ExerciseName,
            dto.Sets,
            dto.Reps,
            dto.Weight,
            dto.Rir,
            dto.Notes);
    }
}
