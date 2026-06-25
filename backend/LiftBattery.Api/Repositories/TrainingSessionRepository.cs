using LiftBattery.Api.Data;
using LiftBattery.Api.Data.Entities.Training;
using LiftBattery.Api.Models;
using LiftBattery.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LiftBattery.Api.Repositories;

public sealed class TrainingRepository : ITrainingRepository
{
    private readonly LiftBatteryDbContext _dbContext;
    private readonly int _defaultUserId;

    public TrainingRepository(
        LiftBatteryDbContext dbContext,
        IOptions<TrainingOptions> options)
    {
        _dbContext = dbContext;
        _defaultUserId = options.Value.DefaultUserId;
    }

    public async Task<IReadOnlyList<TrainingDayModel>> GetByDateRangeAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var days = await _dbContext.TrainingDays
            .AsNoTracking()
            .Include(day => day.Sessions)
                .ThenInclude(session => session.Exercises)
                    .ThenInclude(exercise => exercise.Sets)
            .Where(day => day.UserId == userId && day.Date >= from && day.Date <= to)
            .OrderBy(day => day.Date)
            .ToListAsync(cancellationToken);

        return days.Select(ToModel).ToList();
    }

    public async Task<TrainingDayModel> AddSessionAsync(
        int userId,
        DateOnly date,
        TrainingSessionModel session,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var now = DateTimeOffset.UtcNow;

        var day = await _dbContext.TrainingDays
            .Include(candidate => candidate.Sessions)
                .ThenInclude(candidate => candidate.Exercises)
                    .ThenInclude(candidate => candidate.Sets)
            .SingleOrDefaultAsync(
                candidate => candidate.UserId == userId && candidate.Date == date,
                cancellationToken);

        var sessionEntity = ToEntity(session);

        if (day is null)
        {
            day = new TrainingDay
            {
                UserId = userId,
                Date = date,
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
                Sessions = new List<TrainingSession> { sessionEntity },
            };

            _dbContext.TrainingDays.Add(day);
        }
        else
        {
            sessionEntity.TrainingDayId = day.Id;
            day.Sessions.Add(sessionEntity);
            day.UpdatedAtUtc = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToModel(day);
    }

    public async Task<TrainingSessionModel?> DeleteSessionAsync(
        int userId,
        int sessionId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var session = await _dbContext.TrainingSessions
            .Include(candidate => candidate.Exercises)
                .ThenInclude(candidate => candidate.Sets)
            .Include(candidate => candidate.TrainingDay)
            .SingleOrDefaultAsync(
                candidate => candidate.Id == sessionId && candidate.TrainingDay.UserId == userId,
                cancellationToken);

        if (session is null)
        {
            return null;
        }

        var model = ToModel(session);
        _dbContext.TrainingSessions.Remove(session);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return model;
    }

    private static TrainingDayModel ToModel(TrainingDay entity)
    {
        return new TrainingDayModel(
            entity.Id,
            entity.UserId,
            entity.Date,
            entity.Sessions
                .OrderBy(session => session.StartTime)
                .Select(ToModel)
                .ToList(),
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc);
    }

    private static TrainingSessionModel ToModel(TrainingSession entity)
    {
        return new TrainingSessionModel(
            entity.Id,
            entity.TrainingDayId,
            entity.StartTime,
            entity.DurationMinutes,
            entity.SessionRpe,
            entity.Exercises
                .OrderBy(exercise => exercise.ExerciseOrder)
                .Select(ToModel)
                .ToList(),
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc);
    }

    private static TrainingExerciseModel ToModel(TrainingExercise entity)
    {
        return new TrainingExerciseModel(
            entity.Id,
            entity.TrainingSessionId,
            entity.MuscleGroup,
            entity.ExerciseName,
            entity.ExerciseOrder,
            entity.Sets
                .OrderBy(set => set.SetOrder)
                .Select(ToModel)
                .ToList(),
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc);
    }

    private static TrainingSetModel ToModel(TrainingSet entity)
    {
        return new TrainingSetModel(
            entity.Id,
            entity.TrainingExerciseId,
            entity.SetOrder,
            entity.Reps,
            entity.WeightKg,
            entity.Rpe,
            entity.Rir,
            entity.IsWarmUp,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc);
    }

    private static TrainingSession ToEntity(TrainingSessionModel model)
    {
        var entity = new TrainingSession
        {
            Id = model.Id,
            TrainingDayId = model.TrainingDayId,
            StartTime = model.StartTime,
            DurationMinutes = model.DurationMinutes,
            SessionRpe = model.SessionRpe,
            CreatedAtUtc = model.CreatedAtUtc,
            UpdatedAtUtc = model.UpdatedAtUtc,
            TrainingDay = null!,
        };

        entity.Exercises = model.Exercises
            .Select(exercise => ToEntity(exercise, entity))
            .ToList();

        return entity;
    }

    private static TrainingExercise ToEntity(
        TrainingExerciseModel model,
        TrainingSession session)
    {
        var entity = new TrainingExercise
        {
            Id = model.Id,
            TrainingSessionId = session.Id,
            TrainingSession = session,
            ExerciseOrder = model.ExerciseOrder,
            MuscleGroup = model.MuscleGroup,
            ExerciseName = model.ExerciseName,
            CreatedAtUtc = model.CreatedAtUtc,
            UpdatedAtUtc = model.UpdatedAtUtc,
        };

        entity.Sets = model.Sets
            .Select(set => ToEntity(set, entity))
            .ToList();

        return entity;
    }

    private static TrainingSet ToEntity(
        TrainingSetModel model,
        TrainingExercise exercise)
    {
        return new TrainingSet
        {
            Id = model.Id,
            TrainingExerciseId = exercise.Id,
            TrainingExercise = exercise,
            SetOrder = model.SetOrder,
            Reps = model.Reps,
            WeightKg = model.WeightKg,
            Rpe = model.Rpe,
            Rir = model.Rir,
            IsWarmUp = model.IsWarmup,
            CreatedAtUtc = model.CreatedAtUtc,
            UpdatedAtUtc = model.UpdatedAtUtc,
        };
    }
}
