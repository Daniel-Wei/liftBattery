namespace LiftOps.Api.Models;

public sealed record PreCheckLog(
    string Id,
    DateOnly Date,
    int SleepQuality,
    int Soreness,
    int Stress,
    int Motivation,
    int Energy,
    string? Notes);
