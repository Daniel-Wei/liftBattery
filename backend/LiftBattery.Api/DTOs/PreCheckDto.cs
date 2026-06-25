namespace LiftBattery.Api.DTOs;

public sealed record PreCheckDto(
    int? Id,
    string Date,
    int SleepQuality,
    int Soreness,
    int Stress,
    int Motivation,
    int Energy,
    decimal? SleepHours = null,
    int? SorenessRating = null,
    int? MotivationRating = null,
    int? RestingHeartRateDelta = null,
    int? PreviousSessionRpe = null,
    int? PreviousSessionDurationMinutes = null);
