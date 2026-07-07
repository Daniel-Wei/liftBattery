using Azure;
using LiftBattery.Api.Data;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using LiftBattery.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LiftBattery.Api.Tests;

public sealed class WeeklyReportSchedulingServiceTests
{
    [Fact]
    public async Task DisabledSchedulesAreSkipped()
    {
        await using var database = await TestDatabase.CreateAsync();
        var schedule = CreateSchedule(enabled: false, nextRunAtUtc: DateTimeOffset.Parse("2026-07-07T00:00:00Z"));
        var repository = new FakeScheduleRepository(schedule);
        var jobService = new FakeWeeklyReportJobService();
        var service = CreateService(database.Context, repository, jobService, DateTimeOffset.Parse("2026-07-07T01:00:00Z"));

        await service.ProcessDueSchedulesAsync();

        Assert.Equal(0, jobService.RequestCount);
        Assert.Equal(0, repository.UpdateCount);
    }

    [Fact]
    public async Task FutureSchedulesAreSkipped()
    {
        await using var database = await TestDatabase.CreateAsync();
        var schedule = CreateSchedule(enabled: true, nextRunAtUtc: DateTimeOffset.Parse("2026-07-08T00:00:00Z"));
        var repository = new FakeScheduleRepository(schedule);
        var jobService = new FakeWeeklyReportJobService();
        var service = CreateService(database.Context, repository, jobService, DateTimeOffset.Parse("2026-07-07T01:00:00Z"));

        await service.ProcessDueSchedulesAsync();

        Assert.Equal(0, jobService.RequestCount);
        Assert.Equal(0, repository.UpdateCount);
    }

    [Fact]
    public async Task DueScheduleRequestsWeeklyReportAndUpdatesMetadata()
    {
        await using var database = await TestDatabase.CreateAsync();
        var dueAt = DateTimeOffset.Parse("2026-07-07T00:00:00Z");
        var schedule = CreateSchedule(enabled: true, nextRunAtUtc: dueAt);
        var repository = new FakeScheduleRepository(schedule);
        var jobService = new FakeWeeklyReportJobService();
        var service = CreateService(database.Context, repository, jobService, DateTimeOffset.Parse("2026-07-07T01:00:00Z"));

        await service.ProcessDueSchedulesAsync();

        Assert.Equal(1, jobService.RequestCount);
        Assert.Equal(1, repository.UpdateCount);
        Assert.Equal(dueAt, repository.Schedule.LastRunAtUtc);
        Assert.Equal("weekly-report-user-1:2026-07-07T00:00:00.0000000+00:00", repository.Schedule.LastRunKey);
        Assert.Equal(123, repository.Schedule.LastRequestedJobId);
        Assert.NotNull(repository.Schedule.NextRunAtUtc);
    }

    [Fact]
    public async Task FailedJobRequestDoesNotMarkScheduleSuccessful()
    {
        await using var database = await TestDatabase.CreateAsync();
        var dueAt = DateTimeOffset.Parse("2026-07-07T00:00:00Z");
        var schedule = CreateSchedule(enabled: true, nextRunAtUtc: dueAt);
        var repository = new FakeScheduleRepository(schedule);
        var jobService = new FakeWeeklyReportJobService { ThrowOnRequest = true };
        var service = CreateService(database.Context, repository, jobService, DateTimeOffset.Parse("2026-07-07T01:00:00Z"));

        await service.ProcessDueSchedulesAsync();

        Assert.Equal(1, jobService.RequestCount);
        Assert.Equal(0, repository.UpdateCount);
        Assert.Null(repository.Schedule.LastRunAtUtc);
        Assert.Null(repository.Schedule.LastRunKey);
    }

    [Fact]
    public async Task ETagConflictDoesNotRequestAnotherJobInSameRun()
    {
        await using var database = await TestDatabase.CreateAsync();
        var dueAt = DateTimeOffset.Parse("2026-07-07T00:00:00Z");
        var schedule = CreateSchedule(enabled: true, nextRunAtUtc: dueAt);
        var repository = new FakeScheduleRepository(schedule) { FailUpdates = true };
        var jobService = new FakeWeeklyReportJobService();
        var service = CreateService(database.Context, repository, jobService, DateTimeOffset.Parse("2026-07-07T01:00:00Z"));

        await service.ProcessDueSchedulesAsync();

        Assert.Equal(1, jobService.RequestCount);
        Assert.Equal(1, repository.UpdateCount);
        Assert.Null(repository.Schedule.LastRunKey);
    }

    [Fact]
    public async Task RepeatedTimerExecutionDoesNotRequestSameRunTwiceAfterMetadataUpdate()
    {
        await using var database = await TestDatabase.CreateAsync();
        var dueAt = DateTimeOffset.Parse("2026-07-07T00:00:00Z");
        var schedule = CreateSchedule(enabled: true, nextRunAtUtc: dueAt);
        var repository = new FakeScheduleRepository(schedule);
        var jobService = new FakeWeeklyReportJobService();
        var service = CreateService(database.Context, repository, jobService, DateTimeOffset.Parse("2026-07-07T01:00:00Z"));

        await service.ProcessDueSchedulesAsync();
        await service.ProcessDueSchedulesAsync();

        Assert.Equal(1, jobService.RequestCount);
    }

    private static WeeklyReportScheduleService CreateService(
        LiftBatteryDbContext context,
        IWeeklyReportScheduleRepository repository,
        IWeeklyReportJobService jobService,
        DateTimeOffset now)
    {
        return new WeeklyReportScheduleService(
            repository,
            jobService,
            context,
            new FixedTimeProvider(now),
            NullLogger<WeeklyReportScheduleService>.Instance);
    }

    private static WeeklyReportSchedule CreateSchedule(bool enabled, DateTimeOffset? nextRunAtUtc)
    {
        var now = DateTimeOffset.Parse("2026-07-01T00:00:00Z");
        return new WeeklyReportSchedule
        {
            ScheduleId = "weekly-report-user-1",
            UserId = 1,
            Enabled = enabled,
            DayOfWeek = DayOfWeek.Tuesday,
            TimeOfDay = new TimeOnly(0, 0),
            TimeZoneId = "UTC",
            RecipientEmail = "test@example.com",
            NextRunAtUtc = nextRunAtUtc,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };
    }

    private sealed class FakeScheduleRepository : IWeeklyReportScheduleRepository
    {
        private static readonly ETag TestETag = new("\"test-etag\"");

        public FakeScheduleRepository(WeeklyReportSchedule schedule)
        {
            Schedule = schedule;
        }

        public WeeklyReportSchedule Schedule { get; private set; }

        public bool FailUpdates { get; init; }

        public int UpdateCount { get; private set; }

        public Task<WeeklyReportScheduleDocument?> GetByUserIdAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<WeeklyReportScheduleDocument?>(new WeeklyReportScheduleDocument(Schedule, TestETag));
        }

        public Task<WeeklyReportSchedule> UpsertForUserAsync(
            WeeklyReportSchedule schedule,
            ETag? etag = null,
            CancellationToken cancellationToken = default)
        {
            Schedule = schedule;
            return Task.FromResult(schedule);
        }

        public Task<IReadOnlyList<WeeklyReportScheduleDocument>> GetEnabledAsync(
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<WeeklyReportScheduleDocument>>(
                new[] { new WeeklyReportScheduleDocument(Schedule, TestETag) });
        }

        public Task<bool> TryUpdateAsync(
            WeeklyReportSchedule schedule,
            ETag etag,
            CancellationToken cancellationToken = default)
        {
            UpdateCount++;

            if (FailUpdates)
            {
                return Task.FromResult(false);
            }

            Schedule = schedule;
            return Task.FromResult(true);
        }
    }

    private sealed class FakeWeeklyReportJobService : IWeeklyReportJobService
    {
        public int RequestCount { get; private set; }

        public bool ThrowOnRequest { get; init; }

        public Task<WeeklyReportJobDto> RequestScheduledWeeklyReportAsync(
            int userId,
            string scheduleId,
            DateTimeOffset scheduledForUtc,
            string recipientEmail,
            string timeZoneId,
            CancellationToken cancellationToken = default)
        {
            RequestCount++;

            if (ThrowOnRequest)
            {
                throw new InvalidOperationException("Request failed.");
            }

            return Task.FromResult(new WeeklyReportJobDto(
                123,
                userId,
                scheduleId,
                $"{scheduleId}:{scheduledForUtc:O}",
                WeeklyReportConstants.ReportType,
                "2026-06-30",
                "2026-07-06",
                scheduledForUtc,
                WeeklyReportJobStatuses.Queued,
                null,
                scheduledForUtc,
                scheduledForUtc,
                scheduledForUtc,
                null,
                null));
        }

        public Task ProcessAsync(
            WeeklyReportQueueMessageDto queueMessage,
            CancellationToken cancellationToken = default)
        {
            throw new NotSupportedException();
        }
    }

    private sealed class FixedTimeProvider : TimeProvider
    {
        private readonly DateTimeOffset _now;

        public FixedTimeProvider(DateTimeOffset now)
        {
            _now = now;
        }

        public override DateTimeOffset GetUtcNow()
        {
            return _now;
        }
    }

    private sealed class TestDatabase : IAsyncDisposable
    {
        private readonly SqliteConnection _connection;

        private TestDatabase(SqliteConnection connection, LiftBatteryDbContext context)
        {
            _connection = connection;
            Context = context;
        }

        public LiftBatteryDbContext Context { get; }

        public static async Task<TestDatabase> CreateAsync()
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            var options = new DbContextOptionsBuilder<LiftBatteryDbContext>()
                .UseSqlite(connection)
                .Options;
            var context = new LiftBatteryDbContext(options);
            await context.Database.EnsureCreatedAsync();
            return new TestDatabase(connection, context);
        }

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
            await _connection.DisposeAsync();
        }
    }
}
