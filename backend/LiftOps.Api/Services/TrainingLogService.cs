using LiftOps.Api.DTOs;
using LiftOps.Api.Mapping;
using LiftOps.Api.Repositories;

namespace LiftOps.Api.Services;

public sealed class TrainingLogService : ITrainingLogService
{
    private readonly ITrainingLogRepository _repository;

    public TrainingLogService(ITrainingLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<TrainingLogDto>> GetByDateRangeAsync(DateOnly from, DateOnly to)
    {
        var logs = await _repository.GetByDateRangeAsync(from, to);
        return logs.Select(TrainingLogMapping.ToDto).ToList();
    }

    public async Task<TrainingLogDto> SaveAsync(TrainingLogDto dto)
    {
        var savedLog = await _repository.SaveAsync(TrainingLogMapping.ToModel(dto));
        return TrainingLogMapping.ToDto(savedLog);
    }
}
