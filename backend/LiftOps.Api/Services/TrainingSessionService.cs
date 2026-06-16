using LiftOps.Api.DTOs;
using LiftOps.Api.Mapping;
using LiftOps.Api.Repositories;

namespace LiftOps.Api.Services;

public sealed class TrainingSessionService : ITrainingSessionService
{
    private readonly ITrainingLogRepository _repository;

    public TrainingSessionService(ITrainingLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<TrainingSessionDto>> GetByDateRangeAsync(DateOnly from, DateOnly to)
    {
        var logs = await _repository.GetByDateRangeAsync(from, to);
        return logs.Select(TrainingSessionMapping.ToDto).ToList();
    }

    public async Task<TrainingSessionDto> SaveAsync(TrainingSessionDto dto)
    {
        var savedLog = await _repository.SaveAsync(TrainingSessionMapping.ToModel(dto));
        return TrainingSessionMapping.ToDto(savedLog);
    }
}
