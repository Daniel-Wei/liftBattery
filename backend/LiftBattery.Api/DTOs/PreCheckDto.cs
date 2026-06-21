namespace LiftBattery.Api.DTOs;

public sealed record PreCheckDto(
    string? Id,
    string Date,
    int SleepQuality,
    int Soreness,
    int Stress,
    int Motivation,
    int Energy);
