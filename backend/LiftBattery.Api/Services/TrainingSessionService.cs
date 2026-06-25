using System.Globalization;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Mapping;
using LiftBattery.Api.Repositories;

namespace LiftBattery.Api.Services;

public sealed class TrainingSessionService : ITrainingSessionService
{
    private readonly ITrainingRepository _repository;

    public TrainingSessionService(ITrainingRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<TrainingDayDto>> GetByDateRangeAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        if (from > to)
        {
            throw new ArgumentException("from must not be after to.");
        }

        var days = await _repository.GetByDateRangeAsync(userId, from, to, cancellationToken);
        return days.Select(TrainingMapping.ToDto).ToList();
    }

    public async Task<TrainingDayDto> SaveSessionAsync(
        int userId,
        SaveTrainingSessionDto dto,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        if (!DateOnly.TryParseExact(
            dto.Date,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var date))
        {
            throw new ArgumentException("Date must use yyyy-MM-dd format.");
        }

        ValidateSession(dto);
        var session = TrainingMapping.ToModel(dto, DateTimeOffset.UtcNow);
        var day = await _repository.AddSessionAsync(userId, date, session, cancellationToken);
        return TrainingMapping.ToDto(day);
    }

    public async Task<TrainingSessionDto?> DeleteSessionAsync(
        int userId,
        int id,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        if (id <= 0)
        {
            throw new ArgumentException("Training session id must be positive.");
        }

        var deleted = await _repository.DeleteSessionAsync(userId, id, cancellationToken);

        if (deleted is null)
        {
            return null;
        }

        return TrainingMapping.ToDto(deleted);
    }

    private static void ValidateSession(SaveTrainingSessionDto dto)
    {
        if (dto.DurationMinutes <= 0)
        {
            throw new ArgumentException("Duration must be greater than zero.");
        }

        if (dto.SessionRpe is < 1 or > 10)
        {
            throw new ArgumentException("Session RPE must be between 1 and 10.");
        }

        if (dto.Exercises.Count == 0)
        {
            throw new ArgumentException("At least one exercise is required.");
        }

        foreach (var exercise in dto.Exercises)
        {
            if (string.IsNullOrWhiteSpace(exercise.ExerciseName)
                || string.IsNullOrWhiteSpace(exercise.MuscleGroup))
            {
                throw new ArgumentException("Each exercise requires a muscle group and exercise name.");
            }

            if (exercise.Sets.Count == 0)
            {
                throw new ArgumentException("Each exercise requires at least one set.");
            }

            foreach (var set in exercise.Sets)
            {
                if (set.SetOrder <= 0 || set.Reps <= 0 || set.WeightKg < 0)
                {
                    throw new ArgumentException("Set number and reps must be positive, and weight cannot be negative.");
                }

                if (set.Rpe is < 1 or > 10 || set.Rir < 0)
                {
                    throw new ArgumentException("Set RPE must be between 1 and 10, and RIR cannot be negative.");
                }
            }
        }
    }

    private static void ValidateUserId(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentException("User id must be positive.");
        }
    }
}
