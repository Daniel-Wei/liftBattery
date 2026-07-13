using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using LiftBattery.Api.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace LiftBattery.Api.Tests;

public sealed class TrendReportRunIdTests
{
    [Fact]
    public async Task SubmitAsyncPersistsRunIdAndEnqueuesMessageWithSameRunId()
    {
        var jobRepository = new FakeTrendReportJobRepository();
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(jobRepository, queue);

        var dto = await service.SubmitAsync(1, CreateRequest());

        Assert.NotNull(jobRepository.CreatedJob);
        Assert.NotNull(queue.EnqueuedMessage);
        Assert.StartsWith("trend-report:", jobRepository.CreatedJob.RunId);
        Assert.Equal(jobRepository.CreatedJob.RunId, queue.EnqueuedMessage.RunId);
        Assert.Equal(jobRepository.CreatedJob.RunId, dto.RunId);
    }

    [Fact]
    public async Task ProcessAsyncStopsBeforeClaimingJobWhenRunIdDoesNotMatch()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            Job = CreateJob(runId: "trend-report:current", dataVersion: "v1"),
        };
        var service = CreateService(jobRepository, new FakeTrendReportJobQueue());

        await service.ProcessAsync(CreateQueueMessage(runId: "trend-report:stale", dataVersion: "v1"));

        Assert.Equal(0, jobRepository.TryStartProcessingCallCount);
    }

    [Fact]
    public async Task ProcessAsyncPassesRunIdToProcessingClaim()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            Job = CreateJob(runId: "trend-report:current", dataVersion: "v1"),
            TryStartProcessingResult = false,
        };
        var service = CreateService(jobRepository, new FakeTrendReportJobQueue());

        await service.ProcessAsync(CreateQueueMessage(runId: "trend-report:current", dataVersion: "v1"));

        Assert.Equal(1, jobRepository.TryStartProcessingCallCount);
        Assert.Equal("trend-report:current", jobRepository.LastExpectedRunId);
    }

    private static TrendReportService CreateService(
        FakeTrendReportJobRepository jobRepository,
        FakeTrendReportJobQueue queue)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["TrendReportDemoDelayMilliseconds"] = "0",
            })
            .Build();

        return new TrendReportService(
            jobRepository,
            new FakeTrainingRepository(),
            new FakePreCheckRepository(),
            queue,
            configuration);
    }

    private static CreateTrendReportRequestDto CreateRequest()
    {
        return new CreateTrendReportRequestDto(
            "2026-07-06",
            "2026-07-06",
            null,
            null);
    }

    private static TrendReportQueueMessageDto CreateQueueMessage(
        string runId,
        string dataVersion)
    {
        return new TrendReportQueueMessageDto(
            JobId: 123,
            RunId: runId,
            UserId: 1,
            PeriodStart: "2026-07-06",
            PeriodEnd: "2026-07-12",
            DataVersion: dataVersion,
            RequestedAtUtc: DateTimeOffset.Parse("2026-07-06T00:00:00Z"));
    }

    private static TrendReportJob CreateJob(string runId, string dataVersion)
    {
        var now = DateTimeOffset.Parse("2026-07-06T00:00:00Z");

        return new TrendReportJob(
            Id: 123,
            UserId: 1,
            Status: TrendReportJobStatuses.Queued,
            ProgressPercent: 0,
            CurrentStage: "等待后台处理",
            Request: new TrendReportRequest(
                new DateOnly(2026, 7, 6),
                new DateOnly(2026, 7, 6),
                null,
                null),
            RunId: runId,
            DataVersion: dataVersion,
            ReportFingerprint: "fingerprint",
            Snapshot: new TrendReportReqSnapshot(
                Array.Empty<TrainingDayModel>(),
                Array.Empty<PreCheckModel>()),
            Result: null,
            ErrorMessage: null,
            CreatedAtUtc: now,
            StartedAtUtc: null,
            CompletedAtUtc: null,
            UpdatedAtUtc: now);
    }

    private sealed class FakeTrendReportJobRepository : ITrendReportJobRepository
    {
        public TrendReportJob? CreatedJob { get; private set; }
        public TrendReportJob? Job { get; set; }
        public bool TryStartProcessingResult { get; set; }
        public int TryStartProcessingCallCount { get; private set; }
        public string? LastExpectedRunId { get; private set; }

        public Task<TrendReportJob> CreateAsync(
            TrendReportJob job,
            CancellationToken cancellationToken = default)
        {
            CreatedJob = job;
            Job = job;
            return Task.FromResult(job);
        }

        public Task<string> GetOrCreateCurrentTrendReportReqDataVersionAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult("v1");
        }

        public Task<string> BumpDataVersionAsync(
            int userId,
            DateTimeOffset updatedAtUtc,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult("v2");
        }

        public Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<TrendReportJob>>(Array.Empty<TrendReportJob>());
        }

        public Task<TrendReportJob?> GetLatestByUserIdAndFingerprintAsync(
            int userId,
            string dataVersion,
            string reportFingerprint,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<TrendReportJob?>(null);
        }

        public Task<TrendReportJob?> GetByIdAsync(
            int userId,
            int id,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Job);
        }

        public Task<TrendReportJob> UpdateAsync(
            TrendReportJob job,
            CancellationToken cancellationToken = default)
        {
            Job = job;
            return Task.FromResult(job);
        }

        public Task<bool> TryStartProcessingAsync(
            int userId,
            int jobId,
            string expectedRunId,
            string expectedDataVersion,
            CancellationToken cancellationToken = default)
        {
            TryStartProcessingCallCount++;
            LastExpectedRunId = expectedRunId;
            return Task.FromResult(TryStartProcessingResult);
        }

        public Task<bool> TryUpdateProgressIfCurrentProcessingAsync(
            int userId,
            int jobId,
            string expectedRunId,
            string expectedDataVersion,
            int progressPercent,
            string currentStage,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(false);
        }

        public Task<bool> TryCompleteIfCurrentProcessingAsync(
            int userId,
            int jobId,
            string expectedRunId,
            string expectedDataVersion,
            TrendReportResultDto result,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(false);
        }

        public Task<bool> TryMarkFailedIfCurrentProcessingAsync(
            int userId,
            int jobId,
            string expectedRunId,
            string expectedDataVersion,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(false);
        }

        public Task<bool> TryMarkSupersededIfCancelRequestedAsync(
            int userId,
            int jobId,
            string expectedDataVersion,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(false);
        }

        public Task<bool> TryMarkSupersededIfCurrentAsync(
            int userId,
            int jobId,
            string expectedDataVersion,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(false);
        }
    }

    private sealed class FakeTrendReportJobQueue : ITrendReportJobQueue
    {
        public TrendReportQueueMessageDto? EnqueuedMessage { get; private set; }

        public Task EnqueueAsync(
            TrendReportQueueMessageDto queueMessage,
            CancellationToken cancellationToken = default)
        {
            EnqueuedMessage = queueMessage;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeTrainingRepository : ITrainingRepository
    {
        public Task<IReadOnlyList<TrainingDayModel>> GetByDateRangeAsync(
            int userId,
            DateOnly from,
            DateOnly to,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<TrainingDayModel>>(Array.Empty<TrainingDayModel>());
        }

        public Task<TrainingDayModel> AddSessionAsync(
            int userId,
            DateOnly date,
            TrainingSessionModel session,
            CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<TrainingSessionModel?> DeleteSessionAsync(
            int userId,
            int sessionId,
            CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }
    }

    private sealed class FakePreCheckRepository : IPreCheckRepository
    {
        public Task<PreCheckModel?> GetByDateAsync(
            int userId,
            DateOnly date,
            CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<IReadOnlyList<PreCheckModel>> GetByDateRangeAsync(
            int userId,
            DateOnly from,
            DateOnly to,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<PreCheckModel>>(Array.Empty<PreCheckModel>());
        }

        public Task<IReadOnlyList<PreCheckModel>> GetByDateRangeAsync(
            DateOnly from,
            DateOnly to,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<PreCheckModel>>(Array.Empty<PreCheckModel>());
        }

        public Task<PreCheckModel> UpsertAsync(
            PreCheckModel log,
            CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }

        public Task<PreCheckModel?> DeleteByIdAsync(
            int userId,
            int id,
            CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
        }
    }
}
