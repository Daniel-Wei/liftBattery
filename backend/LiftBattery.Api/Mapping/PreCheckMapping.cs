using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Mapping;

public static class PreCheckMapping
{
    public static PreCheckDto ToDto(PreCheckLog log)
    {
        return new PreCheckDto(
            log.Id,
            log.Date.ToString("yyyy-MM-dd"),
            log.SleepQuality,
            log.Soreness,
            log.Stress,
            log.Motivation,
            log.Energy);
    }

    public static PreCheckLog ToModel(PreCheckDto dto)
    {
        return new PreCheckLog(
            dto.Id ?? Guid.NewGuid().ToString("N"),
            DateOnly.Parse(dto.Date),
            dto.SleepQuality,
            dto.Soreness,
            dto.Stress,
            dto.Motivation,
            dto.Energy);
    }
}
