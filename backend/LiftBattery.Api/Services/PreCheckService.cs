using System.Globalization;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Mapping;
using LiftBattery.Api.Repositories;

namespace LiftBattery.Api.Services;

public sealed class PreCheckService : IPreCheckService
{
    private readonly IPreCheckRepository _repository;
    private readonly TimeProvider _timeProvider;

    public PreCheckService(IPreCheckRepository repository, TimeProvider timeProvider)
    {
        _repository = repository;
        _timeProvider = timeProvider;
    }

    public async Task<PreCheckDto?> GetByDateAsync(
        int userId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);
        var log = await _repository.GetByDateAsync(userId, date, cancellationToken);
        return log is null ? null : PreCheckMapping.ToDto(log);
    }

    public async Task<IReadOnlyList<PreCheckDto>> GetByDateRangeAsync(
        int userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        if (from > to)
        {
            throw new ArgumentException("From date must not be after to date.");
        }

        if (to.DayNumber - from.DayNumber > 366)
        {
            throw new ArgumentException("Pre-check date ranges cannot exceed 366 days.");
        }

        var logs = await _repository.GetByDateRangeAsync(
            userId,
            from,
            to,
            cancellationToken);
        return logs.Select(PreCheckMapping.ToDto).ToList();
    }

    public async Task<PreCheckDto> SaveAsync(
        int userId,
        PreCheckDto dto,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);
        var date = ParseDate(dto.Date);
        ValidateRatings(dto);
        var normalizedUserId = userId;
        var existing = await _repository.GetByDateAsync(
            normalizedUserId,
            date,
            cancellationToken);
        var now = _timeProvider.GetUtcNow();
        var log = PreCheckMapping.ToModel(dto, normalizedUserId, date, now, existing);
        var savedLog = await _repository.UpsertAsync(log, cancellationToken);
        return PreCheckMapping.ToDto(savedLog);
    }

    public async Task<PreCheckDto?> DeleteAsync(
        int userId,
        int id,
        CancellationToken cancellationToken = default)
    {
        ValidateUserId(userId);

        if (id <= 0)
        {
            throw new ArgumentException("Pre-check id must be positive.");
        }

        var deletedLog = await _repository.DeleteByIdAsync(
            userId,
            id,
            cancellationToken);
        return deletedLog is null ? null : PreCheckMapping.ToDto(deletedLog);
    }

    private static DateOnly ParseDate(string value)
    {
        if (!DateOnly.TryParseExact(
            value,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var date))
        {
            throw new ArgumentException("Pre-check date must use yyyy-MM-dd format.");
        }

        return date;
    }

    private static void ValidateUserId(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentException("User id must be positive.");
        }
    }

    private static void ValidateRatings(PreCheckDto dto)
    {
        ValidateRange(dto.SleepQuality, 1, 5, nameof(dto.SleepQuality));
        ValidateRange(dto.Soreness, 1, 5, nameof(dto.Soreness));
        ValidateRange(dto.Stress, 1, 5, nameof(dto.Stress));
        ValidateRange(dto.Motivation, 1, 5, nameof(dto.Motivation));
        ValidateRange(dto.Energy, 1, 5, nameof(dto.Energy));
        ValidateRange(dto.SleepHours, 0, 12, nameof(dto.SleepHours));
        ValidateRange(dto.SorenessRating, 1, 10, nameof(dto.SorenessRating));
        ValidateRange(dto.MotivationRating, 1, 10, nameof(dto.MotivationRating));
        ValidateRange(dto.RestingHeartRateDelta, -5, 20, nameof(dto.RestingHeartRateDelta));
        ValidateRange(dto.PreviousSessionRpe, 1, 10, nameof(dto.PreviousSessionRpe));
        ValidateRange(
            dto.PreviousSessionDurationMinutes,
            20,
            120,
            nameof(dto.PreviousSessionDurationMinutes));
    }

    private static void ValidateRange(int value, int min, int max, string name)
    {
        if (value < min || value > max)
        {
            throw new ArgumentException($"{name} must be between {min} and {max}.");
        }
    }

    private static void ValidateRange(decimal? value, decimal min, decimal max, string name)
    {
        if (value.HasValue && (value.Value < min || value.Value > max))
        {
            throw new ArgumentException($"{name} must be between {min} and {max}.");
        }
    }

    private static void ValidateRange(int? value, int min, int max, string name)
    {
        if (value.HasValue)
        {
            ValidateRange(value.Value, min, max, name);
        }
    }
}
