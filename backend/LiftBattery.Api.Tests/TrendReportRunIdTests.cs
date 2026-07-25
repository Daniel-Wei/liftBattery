using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using LiftBattery.Api.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace LiftBattery.Api.Tests;

public sealed class TrendReportRunIdTests
{
    private static readonly Guid DefaultJobId =
        Guid.Parse("00000000-0000-0000-0000-000000000123");

    [Fact]
    public async Task SubmitAsyncReturnsNoDataWithoutCreatingJobWhenSnapshotIsEmpty()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            CurrentDataVersion = null,
        };
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(
            jobRepository,
            queue,
            trainingRepository: new FakeTrainingRepository());

        var exception = await Assert.ThrowsAsync<TrendReportNoDataException>(
            () => service.SubmitAsync(1, CreateRequest()));

        Assert.Contains("No training or pre-check data", exception.Message);
        Assert.Null(jobRepository.CreatedJob);
        Assert.Equal(0, queue.EnqueueCount);
        Assert.Equal(0, jobRepository.DataVersionReadCallCount);
        Assert.Equal(0, jobRepository.BumpDataVersionCallCount);
    }

    [Fact]
    public async Task SubmitAsyncFailsWhenSourceDataExistsWithoutDataVersion()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            CurrentDataVersion = null,
        };
        var trainingRepository = new FakeTrainingRepository();
        trainingRepository.TrainingDays.Add(CreateTrainingDay());
        var service = CreateService(
            jobRepository,
            new FakeTrendReportJobQueue(),
            trainingRepository: trainingRepository);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.SubmitAsync(1, CreateRequest()));

        Assert.Contains("no DataVersion was found", exception.Message);
        Assert.Null(jobRepository.CreatedJob);
        Assert.Equal(0, jobRepository.BumpDataVersionCallCount);
    }

    [Fact]
    public async Task SubmitAsyncPersistsRunIdAndEnqueuesMessageWithSameRunId()
    {
        var jobRepository = new FakeTrendReportJobRepository();
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(jobRepository, queue);

        var dto = await service.SubmitAsync(1, CreateRequest());

        Assert.NotNull(jobRepository.CreatedJob);
        Assert.NotEqual(Guid.Empty, jobRepository.CreatedJob.Id);
        Assert.NotNull(queue.EnqueuedMessage);
        Assert.Equal(TrendReportJobStatuses.EnqueuePending, jobRepository.CreatedJob.Status);
        Assert.Equal(TrendReportJobStatuses.Queued, dto.Status);
        Assert.StartsWith("trend-report:", jobRepository.CreatedJob.RunId);
        Assert.Equal(jobRepository.CreatedJob.RunId, queue.EnqueuedMessage.RunId);
        Assert.Equal(jobRepository.CreatedJob.RunId, dto.RunId);
    }

    [Fact]
    public async Task SubmitAsyncKeepsJobPendingWhenInitialEnqueueFails()
    {
        var jobRepository = new FakeTrendReportJobRepository();
        var queue = new FakeTrendReportJobQueue { ThrowOnEnqueue = true };
        var service = CreateService(jobRepository, queue);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.SubmitAsync(1, CreateRequest()));

        Assert.Equal(TrendReportJobStatuses.EnqueuePending, jobRepository.Job?.Status);
        Assert.Equal("提交后台队列失败，等待自动重试。", jobRepository.Job?.CurrentStage);
        Assert.Null(jobRepository.Job?.ErrorMessage);
    }

    [Fact]
    public async Task SubmitAsyncConcurrentIdenticalRequestsShareOneCreatedJobAndOneEnqueue()
    {
        var jobRepository = new FakeTrendReportJobRepository();
        jobRepository.AdditionalActiveJobs.Add(CreateJob(
            id: Guid.Parse("00000000-0000-0000-0000-000000000900"),
            runId: "trend-report:old",
            dataVersion: "v1") with
        {
            Status = TrendReportJobStatuses.Queued,
        });
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(jobRepository, queue);

        var results = await Task.WhenAll(Enumerable
            .Range(0, 10)
            .Select(_ => service.SubmitAsync(1, CreateRequest())));

        Assert.Single(results.Select(result => result.Id).Distinct());
        Assert.Single(results.Select(result => result.RunId).Distinct());
        Assert.Equal(1, jobRepository.CreateOrGetCreatedCount);
        Assert.Equal(1, queue.EnqueueCount);
        Assert.Equal(1, jobRepository.GetActiveCallCount);
        Assert.Equal(1, jobRepository.CancelledUpdateCount);
    }

    [Fact]
    public async Task SubmitAsyncReusesCompletedJobWithoutSecondEnqueue()
    {
        var jobRepository = new FakeTrendReportJobRepository();
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(jobRepository, queue);

        var first = await service.SubmitAsync(1, CreateRequest());
        jobRepository.Job = jobRepository.Job! with
        {
            Status = TrendReportJobStatuses.Completed,
            CompletedAtUtc = DateTimeOffset.UtcNow,
        };

        var second = await service.SubmitAsync(1, CreateRequest());

        Assert.Equal(first.Id, second.Id);
        Assert.Equal(first.RunId, second.RunId);
        Assert.Equal(1, jobRepository.CreateOrGetCreatedCount);
        Assert.Equal(1, queue.EnqueueCount);
    }

    [Fact]
    public async Task SubmitAsyncConcurrentRequestsReuseFailedJobWithoutSecondEnqueue()
    {
        var jobRepository = new FakeTrendReportJobRepository();
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(jobRepository, queue);

        var failed = await service.SubmitAsync(1, CreateRequest());
        jobRepository.Job = jobRepository.Job! with
        {
            Status = TrendReportJobStatuses.Failed,
            ErrorMessage = "Failed before retry.",
            CompletedAtUtc = DateTimeOffset.UtcNow,
        };

        var results = await Task.WhenAll(Enumerable
            .Range(0, 8)
            .Select(_ => service.SubmitAsync(1, CreateRequest())));

        Assert.All(results, result => Assert.Equal(failed.Id, result.Id));
        Assert.Single(results.Select(result => result.Id).Distinct());
        Assert.Single(results.Select(result => result.RunId).Distinct());
        Assert.Equal(1, jobRepository.CreateOrGetCreatedCount);
        Assert.Equal(1, queue.EnqueueCount);
    }

    [Fact]
    public async Task InvalidationMarksProcessingJobSupersededDirectly()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            Job = CreateJob(
                runId: "trend-report:processing",
                dataVersion: "v1") with
            {
                Status = TrendReportJobStatuses.Processing,
            },
        };
        var service = new TrendReportInvalidationService(jobRepository);

        await service.InvalidateForReportDataChangeAsync(
            userId: 1,
            changedDate: new DateOnly(2026, 7, 6));

        Assert.Equal(TrendReportJobStatuses.Superseded, jobRepository.Job?.Status);
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
    public async Task RecoverUnstartedEnqueuesAsyncCancelsOtherActiveJobsBeforeEnqueue()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            Job = CreateJob(
                runId: "trend-report:pending",
                dataVersion: "v1") with
            {
                Status = TrendReportJobStatuses.EnqueuePending,
            },
        };
        jobRepository.AdditionalActiveJobs.Add(CreateJob(
            id: Guid.Parse("00000000-0000-0000-0000-000000000900"),
            runId: "trend-report:old",
            dataVersion: "v1") with
        {
            Status = TrendReportJobStatuses.Queued,
        });
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(jobRepository, queue);

        var recovered = await service.RecoverUnstartedEnqueuesAsync(
            DateTimeOffset.Parse("2026-07-06T00:05:00Z"),
            maxCount: 10);

        Assert.Equal(1, recovered);
        Assert.Equal(1, jobRepository.CancelledUpdateCount);
        Assert.Equal(TrendReportJobStatuses.Cancelled, jobRepository.AdditionalActiveJobs.Single().Status);
        Assert.Equal(1, queue.EnqueueCount);
        Assert.Equal(TrendReportJobStatuses.Queued, jobRepository.Job?.Status);
    }

    [Fact]
    public async Task RecoverUnstartedEnqueuesAsyncDoesNotEnqueueWhenOldActiveCancellationFails()
    {
        var jobRepository = new FakeTrendReportJobRepository
        {
            Job = CreateJob(
                runId: "trend-report:pending",
                dataVersion: "v1") with
            {
                Status = TrendReportJobStatuses.EnqueuePending,
            },
            ThrowOnCancelUpdate = true,
        };
        jobRepository.AdditionalActiveJobs.Add(CreateJob(
            id: Guid.Parse("00000000-0000-0000-0000-000000000900"),
            runId: "trend-report:old",
            dataVersion: "v1") with
        {
            Status = TrendReportJobStatuses.Queued,
        });
        var queue = new FakeTrendReportJobQueue();
        var service = CreateService(jobRepository, queue);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RecoverUnstartedEnqueuesAsync(
                DateTimeOffset.Parse("2026-07-06T00:05:00Z"),
                maxCount: 10));

        Assert.Equal(0, queue.EnqueueCount);
        Assert.Equal(TrendReportJobStatuses.EnqueuePending, jobRepository.Job?.Status);
        Assert.Equal(1, jobRepository.EnqueueRecoveryAttemptCount);
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
        int enqueueRecoveryMaxAttempts = 5,
        FakeTrainingRepository? trainingRepository = null)
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
            trainingRepository ?? CreatePopulatedTrainingRepository(),
            new FakePreCheckRepository(),
            queue,
            configuration);
    }

    private static FakeTrainingRepository CreatePopulatedTrainingRepository()
    {
        var repository = new FakeTrainingRepository();
        repository.TrainingDays.Add(CreateTrainingDay());
        return repository;
    }

    private static TrainingDayModel CreateTrainingDay()
    {
        return new TrainingDayModel(
            Id: 1,
            UserId: 1,
            Date: new DateOnly(2026, 7, 6),
            Sessions: Array.Empty<TrainingSessionModel>(),
            CreatedAtUtc: DateTimeOffset.UtcNow,
            UpdatedAtUtc: DateTimeOffset.UtcNow);
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
            JobId: DefaultJobId,
            RunId: runId,
            UserId: 1,
            PeriodStart: "2026-07-06",
            PeriodEnd: "2026-07-12",
            DataVersion: dataVersion,
            RequestedAtUtc: DateTimeOffset.Parse("2026-07-06T00:00:00Z"));
    }

    private static TrendReportJob CreateJob(
        string runId,
        string dataVersion,
        Guid? id = null)
    {
        var now = DateTimeOffset.Parse("2026-07-06T00:00:00Z");

        return new TrendReportJob(
            Id: id ?? DefaultJobId,
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
        private readonly object _sync = new();
        public TrendReportJob? CreatedJob { get; private set; }
        public TrendReportJob? Job { get; set; }
        public List<TrendReportJob> AdditionalActiveJobs { get; } = new();
        public int CreateOrGetCreatedCount { get; private set; }
        public int GetActiveCallCount { get; private set; }
        public int CancelledUpdateCount { get; private set; }
        public bool ThrowOnCancelUpdate { get; set; }
        public bool TryStartProcessingResult { get; set; }
        public int TryStartProcessingCallCount { get; private set; }
        public int EnqueueRecoveryAttemptCount { get; private set; }
        public int DataVersionReadCallCount { get; private set; }
        public int BumpDataVersionCallCount { get; private set; }
        public string? LastExpectedRunId { get; private set; }

        public Task<CreateOrGetTrendReportJobResult> CreateOrGetAsync(
            NewTrendReportJob newJob,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            lock (_sync)
            {
                if (Job is not null
                    && Job.UserId == newJob.UserId
                    && Job.DataVersion == newJob.DataVersion
                    && Job.Request == newJob.Request)
                {
                    return Task.FromResult(new CreateOrGetTrendReportJobResult(Job, WasCreated: false));
                }

                var now = DateTimeOffset.UtcNow;
                var created = new TrendReportJob(
                    Id: Guid.NewGuid(),
                    UserId: newJob.UserId,
                    Status: TrendReportJobStatuses.EnqueuePending,
                    ProgressPercent: 0,
                    CurrentStage: newJob.CurrentStage,
                    Request: newJob.Request,
                    RunId: newJob.RunId,
                    DataVersion: newJob.DataVersion,
                    Snapshot: newJob.Snapshot,
                    Result: null,
                    ErrorMessage: null,
                    CreatedAtUtc: now,
                    StartedAtUtc: null,
                    CompletedAtUtc: null,
                    UpdatedAtUtc: now);

                CreatedJob = created;
                Job = created;
                CreateOrGetCreatedCount++;
                return Task.FromResult(new CreateOrGetTrendReportJobResult(created, WasCreated: true));
            }
        }

        public string? CurrentDataVersion { get; set; } = "v1";

        public Task<string?> GetCurrentTrendReportReqDataVersionAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            DataVersionReadCallCount++;
            return Task.FromResult(CurrentDataVersion);
        }

        public Task<string> BumpDataVersionAsync(
            int userId,
            DateTimeOffset updatedAtUtc,
            CancellationToken cancellationToken = default)
        {
            BumpDataVersionCallCount++;
            return Task.FromResult("v2");
        }

        public Task<IReadOnlyList<TrendReportJob>> GetActiveByUserIdAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            GetActiveCallCount++;

            var activeJobs = AdditionalActiveJobs
                .Concat(Job is not null ? new[] { Job } : Array.Empty<TrendReportJob>())
                .Where(job => job.UserId == userId
                    && job.Status is TrendReportJobStatuses.EnqueuePending
                        or TrendReportJobStatuses.Queued
                        or TrendReportJobStatuses.Processing)
                .ToArray();

            return Task.FromResult<IReadOnlyList<TrendReportJob>>(activeJobs);
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

        public Task<TrendReportJob?> GetByIdAsync(
            int userId,
            Guid id,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<TrendReportJob?>(Job);
        }

        public Task<bool> TryMarkCancelledIfActiveAsync(
            int userId,
            Guid jobId,
            string expectedRunId,
            string expectedDataVersion,
            CancellationToken cancellationToken = default)
        {
            if (ThrowOnCancelUpdate)
            {
                throw new InvalidOperationException("Cancel old active job failed.");
            }

            var activeIndex = AdditionalActiveJobs.FindIndex(activeJob => activeJob.Id == jobId);
            var current = Job?.Id == jobId
                ? Job
                : activeIndex >= 0
                    ? AdditionalActiveJobs[activeIndex]
                    : null;

            if (current is null
                || current.UserId != userId
                || current.RunId != expectedRunId
                || current.DataVersion != expectedDataVersion
                || current.Status is not (TrendReportJobStatuses.EnqueuePending
                    or TrendReportJobStatuses.Queued
                    or TrendReportJobStatuses.Processing))
            {
                return Task.FromResult(false);
            }

            var cancelled = current with
            {
                Status = TrendReportJobStatuses.Cancelled,
                CurrentStage = "已取消：用户提交了新的报告请求",
                ErrorMessage = null,
                CompletedAtUtc = DateTimeOffset.UtcNow,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };

            if (Job?.Id == jobId)
            {
                Job = cancelled;
            }

            if (activeIndex >= 0)
            {
                AdditionalActiveJobs[activeIndex] = cancelled;
            }

            CancelledUpdateCount++;
            return Task.FromResult(true);
        }

        public Task<bool> TryRecordInitialEnqueueFailureAsync(
            int userId,
            Guid jobId,
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
                CurrentStage = "提交后台队列失败，等待自动重试。",
                ErrorMessage = null,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };
            return Task.FromResult(true);
        }

        public Task<bool> TryStartProcessingAsync(
            int userId,
            Guid jobId,
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
            Guid jobId,
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
            Guid jobId,
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
            Guid jobId,
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
            Guid jobId,
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
            Guid jobId,
            string expectedRunId,
            string expectedDataVersion,
            TrendReportResultDto result,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(false);
        }

        public Task<bool> TryMarkFailedIfCurrentProcessingAsync(
            int userId,
            Guid jobId,
            string expectedRunId,
            string expectedDataVersion,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(false);
        }

        public Task<bool> TryMarkSupersededIfCurrentAsync(
            int userId,
            string runId,
            Guid jobId,
            string expectedDataVersion,
            CancellationToken cancellationToken = default)
        {
            if (Job is null
                || Job.UserId != userId
                || Job.Id != jobId
                || Job.RunId != runId
                || Job.DataVersion != expectedDataVersion
                || Job.Status is not (TrendReportJobStatuses.EnqueuePending
                    or TrendReportJobStatuses.Queued
                    or TrendReportJobStatuses.Processing))
            {
                return Task.FromResult(false);
            }

            Job = Job with
            {
                Status = TrendReportJobStatuses.Superseded,
                CompletedAtUtc = DateTimeOffset.UtcNow,
                UpdatedAtUtc = DateTimeOffset.UtcNow,
            };
            return Task.FromResult(true);
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
        public List<TrainingDayModel> TrainingDays { get; } = new();

        public Task<IReadOnlyList<TrainingDayModel>> GetByDateRangeAsync(
            int userId,
            DateOnly from,
            DateOnly to,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<TrainingDayModel>>(TrainingDays);
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
