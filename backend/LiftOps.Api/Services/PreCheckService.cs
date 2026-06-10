using LiftOps.Api.DTOs;
using LiftOps.Api.Mapping;
using LiftOps.Api.Repositories;

namespace LiftOps.Api.Services;

public sealed class PreCheckService : IPreCheckService
{
    private readonly IPreCheckRepository _repository;

    public PreCheckService(IPreCheckRepository repository)
    {
        _repository = repository;
    }

    public async Task<PreCheckDto?> GetTodayAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var log = await _repository.GetByDateAsync(today);
        return log is null ? null : PreCheckMapping.ToDto(log);
    }

    public async Task<PreCheckDto> SaveAsync(PreCheckDto dto)
    {
        var savedLog = await _repository.SaveAsync(PreCheckMapping.ToModel(dto));
        return PreCheckMapping.ToDto(savedLog);
    }
}
