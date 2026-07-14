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
        Assert.Equal(TrendReportJobStatuses.EnqueuePending, jobRepository.CreatedJob.Status);
        Assert.Equal(TrendReportJobStatuses.Queued, dto.Status);
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

    [Fact]
    public async Task RecoverUnstartedEnqueuesAsyncReenqueuesPendingJobAndMarksQueued()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            Job = CreateJob(
                runId: "trend-report:pending",
                dataVersion: "v1") with
            {
                Status = TrendReportJobStatuses.EnqueuePending,
                CurrentStage = "正在提交后台队列",
            },
        };
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(jobRepository, queue);

        var recovered = await service.RecoverUnstartedEnqueuesAsync(
            DateTimeOffset.Parse("2026-07-06T00:05:00Z"),
            maxCount: 10);

        Assert.Equal(1, recovered);
        Assert.Equal(1, queue.EnqueueCount);
        Assert.Equal("trend-report:pending", queue.EnqueuedMessage?.RunId);
        Assert.Equal(TrendReportJobStatuses.Queued, jobRepository.Job?.Status);
    }

    [Fact]
    public async Task RecoverUnstartedEnqueuesAsyncMarksPendingJobFailedAfterRetryLimit()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            Job = CreateJob(
                runId: "trend-report:pending",
                dataVersion: "v1") with
            {
                Status = TrendReportJobStatuses.EnqueuePending,
                CurrentStage = "Submitting background queue",
            },
        };
        var queue = new FakeTrendReportJobQueue { ThrowOnEnqueue = true };
        var service = CreateService(jobRepository, queue, enqueueRecoveryMaxAttempts: 2);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RecoverUnstartedEnqueuesAsync(
                DateTimeOffset.Parse("2026-07-06T00:05:00Z"),
                maxCount: 10));

        Assert.Equal(TrendReportJobStatuses.EnqueuePending, jobRepository.Job?.Status);
        Assert.Equal(1, jobRepository.EnqueueRecoveryAttemptCount);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RecoverUnstartedEnqueuesAsync(
                DateTimeOffset.Parse("2026-07-06T00:05:00Z"),
                maxCount: 10));

        Assert.Equal(TrendReportJobStatuses.Failed, jobRepository.Job?.Status);
        Assert.Equal(2, jobRepository.EnqueueRecoveryAttemptCount);
        Assert.Equal("Service Bus send failed.", jobRepository.Job?.ErrorMessage);

        var recovered = await service.RecoverUnstartedEnqueuesAsync(
            DateTimeOffset.Parse("2026-07-06T00:05:00Z"),
            maxCount: 10);

        Assert.Equal(0, recovered);
        Assert.Equal(2, queue.EnqueueCount);
    }


    private static TrendReportService CreateService(
        FakeTrendReportJobRepository jobRepository,
        FakeTrendReportJobQueue queue,
        int enqueueRecoveryMaxAttempts = 5)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["TrendReportDemoDelayMilliseconds"] = "0",
                ["TrendReportEnqueueRecoveryMaxAttempts"] = enqueueRecoveryMaxAttempts.ToString(),
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
        public int EnqueueRecoveryAttemptCount { get; private set; }
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

        public Task<IReadOnlyList<TrendReportJob>> GetUnstartedJobsForEnqueueRecoveryAsync(
            DateTimeOffset olderThanUtc,
            int maxCount,
            CancellationToken cancellationToken = default)
        {
            var jobs = Job is { Status: TrendReportJobStatuses.EnqueuePending or TrendReportJobStatuses.Queued, StartedAtUtc: null }
                ? new[] { Job }
                : Array.Empty<TrendReportJob>();

            return Task.FromResult<IReadOnlyList<TrendReportJob>>(jobs);
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
            return Task.FromResult<TrendReportJob?>(Job);
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

        public Task<bool> TryMarkQueuedIfEnqueuePendingAsync(
            int userId,
            int jobId,
            string expectedRunId,
            string expectedDataVersion,
            CancellationToken cancellationToken = default)
        {
            if (Job is null
                || Job.UserId != userId
                || Job.Id != jobId
                || Job.RunId != expectedRunId
                || Job.DataVersion != expectedDataVersion
                || Job.Status != TrendReportJobStatuses.EnqueuePending)
            {
                return Task.FromResult(false);
            }

            Job = Job with
            {
                Status = TrendReportJobStatuses.Queued,
                CurrentStage = "等待后台处理",
            };

            return Task.FromResult(true);
        }

        public Task<TrendReportJob?> TryBeginEnqueueRecoveryAttemptAsync(
            int userId,
            int jobId,
            string expectedRunId,
            string expectedDataVersion,
            int maxAttempts,
            CancellationToken cancellationToken = default)
        {
            if (Job is null
                || Job.UserId != userId
                || Job.Id != jobId
                || Job.RunId != expectedRunId
                || Job.DataVersion != expectedDataVersion
                || Job.Status != TrendReportJobStatuses.EnqueuePending
                || Job.ErrorMessage is not null)
            {
                return Task.FromResult<TrendReportJob?>(Job);
            }

            if (EnqueueRecoveryAttemptCount >= Math.Max(1, maxAttempts))
            {
                Job = Job with
                {
                    Status = TrendReportJobStatuses.Failed,
                    CurrentStage = "报告任务提交后台队列失败",
                    ErrorMessage = $"Trend report enqueue recovery retry limit exceeded after {EnqueueRecoveryAttemptCount} attempts.",
                    CompletedAtUtc = DateTimeOffset.UtcNow,
                    UpdatedAtUtc = DateTimeOffset.UtcNow,
                };
            }
            else
            {
                EnqueueRecoveryAttemptCount++;
            }

            return Task.FromResult<TrendReportJob?>(Job);
        }

        public Task<bool> TryRecordEnqueueRecoveryFailureAsync(
            int userId,
            int jobId,
            string expectedRunId,
            string expectedDataVersion,
            string errorMessage,
            int maxAttempts,
            CancellationToken cancellationToken = default)
        {
            if (Job is null
                || Job.UserId != userId
                || Job.Id != jobId
                || Job.RunId != expectedRunId
                || Job.DataVersion != expectedDataVersion
                || Job.Status != TrendReportJobStatuses.EnqueuePending)
            {
                return Task.FromResult(false);
            }

            if (EnqueueRecoveryAttemptCount >= Math.Max(1, maxAttempts))
            {
                Job = Job with
                {
                    Status = TrendReportJobStatuses.Failed,
                    CurrentStage = "报告任务提交后台队列失败",
                    ErrorMessage = errorMessage,
                    CompletedAtUtc = DateTimeOffset.UtcNow,
                    UpdatedAtUtc = DateTimeOffset.UtcNow,
                };
            }

            return Task.FromResult(true);
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
            string runId,
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
        public int EnqueueCount { get; private set; }
        public bool ThrowOnEnqueue { get; init; }

        public Task EnqueueAsync(
            TrendReportQueueMessageDto queueMessage,
            CancellationToken cancellationToken = default)
        {
            EnqueueCount++;
            EnqueuedMessage = queueMessage;

            if (ThrowOnEnqueue)
            {
                throw new InvalidOperationException("Service Bus send failed.");
            }

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
