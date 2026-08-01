using LiftBattery.Api.Data;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Entities;
using LiftBattery.Api.Repositories;
using LiftBattery.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LiftBattery.Api.Tests;

public sealed class WeeklyReportSchedulingServiceTests
{
    [Fact]
    public async Task DisabledScheduleIsNotDispatched()
    {
        await using var database = await TestDatabase.CreateAsync();
        var repository = new FakeScheduleRepository(
            CreateSchedule(false, DateTimeOffset.Parse("2026-07-07T00:00:00Z")));
        var queue = new FakeWeeklyReportQueue();
        var service = CreateService(database.Context, repository, queue);

        await service.ProcessDueSchedulesAsync();

        Assert.Empty(queue.Messages);
    }

    [Fact]
    public async Task FutureScheduleIsNotDispatched()
    {
        await using var database = await TestDatabase.CreateAsync();
        var repository = new FakeScheduleRepository(
            CreateSchedule(true, DateTimeOffset.Parse("2026-07-08T00:00:00Z")));
        var queue = new FakeWeeklyReportQueue();
        var service = CreateService(database.Context, repository, queue);

        await service.ProcessDueSchedulesAsync();

        Assert.Empty(queue.Messages);
    }

    [Fact]
    public async Task DueSchedulePublishesOnlyScheduleAndPeriodAndKeepsNextRunUntilCompletion()
    {
        await using var database = await TestDatabase.CreateAsync();
        var dueAt = DateTimeOffset.Parse("2026-07-07T00:00:00Z");
        var schedule = CreateSchedule(true, dueAt);
        var repository = new FakeScheduleRepository(schedule);
        var queue = new FakeWeeklyReportQueue();
        var service = CreateService(database.Context, repository, queue);

        await service.ProcessDueSchedulesAsync();

        var message = Assert.Single(queue.Messages);
        Assert.Equal(schedule.ScheduleId, message.ScheduleId);
        Assert.Equal("2026-06-30_2026-07-06", message.PeriodKey);
        Assert.Equal(dueAt, repository.Schedule.NextRunAtUtc);
        Assert.Equal(message.PeriodKey, repository.Schedule.ClaimedPeriodKey);
    }

    [Fact]
    public async Task QueueFailureReleasesDispatcherClaimForNextTimerPass()
    {
        await using var database = await TestDatabase.CreateAsync();
        var repository = new FakeScheduleRepository(
            CreateSchedule(true, DateTimeOffset.Parse("2026-07-07T00:00:00Z")));
        var queue = new FakeWeeklyReportQueue { ThrowOnEnqueue = true };
        var service = CreateService(database.Context, repository, queue);

        await service.ProcessDueSchedulesAsync();

        Assert.Equal(1, repository.ReleaseCount);
        Assert.Null(repository.Schedule.LeaseUntilUtc);
        Assert.Null(repository.Schedule.ClaimedBy);
    }

    [Fact]
    public async Task ActiveDispatcherLeasePreventsRepeatedTimerDispatch()
    {
        await using var database = await TestDatabase.CreateAsync();
        var repository = new FakeScheduleRepository(
            CreateSchedule(true, DateTimeOffset.Parse("2026-07-07T00:00:00Z")));
        var queue = new FakeWeeklyReportQueue();
        var service = CreateService(database.Context, repository, queue);

        await service.ProcessDueSchedulesAsync();
        await service.ProcessDueSchedulesAsync();

        Assert.Single(queue.Messages);
    }

    [Fact]
    public async Task SqlRepositoryConditionalClaimHasOnlyOneWinner()
    {
        await using var database = await TestDatabase.CreateAsync();
        var now = DateTimeOffset.Parse("2026-07-07T01:00:00Z");
        database.Context.Users.Add(new User
        {
            DisplayName = "Test",
            Email = "test@example.com",
            NormalizedEmail = "TEST@EXAMPLE.COM",
            PasswordHash = "hash",
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        });
        await database.Context.SaveChangesAsync();
        database.Context.WeeklyReportSchedules.Add(CreateSchedule(
            true,
            DateTimeOffset.Parse("2026-07-07T00:00:00Z")));
        await database.Context.SaveChangesAsync();
        var repository = new WeeklyReportScheduleSqlRepository(database.Context);

        var first = await repository.ClaimDueAsync(now, now.AddMinutes(10), "timer-a", 100);
        var second = await repository.ClaimDueAsync(now, now.AddMinutes(10), "timer-b", 100);

        Assert.Single(first);
        Assert.Empty(second);
    }

    [Fact]
    public async Task SavingLaterTimeDoesNotScheduleAnAlreadySentPeriodAgain()
    {
        await using var database = await TestDatabase.CreateAsync();
        var schedule = CreateSchedule(true, DateTimeOffset.Parse("2026-07-14T00:00:00Z"));
        schedule.LastPeriodKey = "2026-06-30_2026-07-06";
        var repository = new FakeScheduleRepository(schedule);
        var service = CreateService(database.Context, repository, new FakeWeeklyReportQueue());

        await service.SaveForUserAsync(
            1,
            new UpdateWeeklyReportScheduleRequestDto(
                true,
                "Tuesday",
                "02:00",
                "test@example.com",
                "UTC"));

        Assert.Equal(
            DateTimeOffset.Parse("2026-07-14T02:00:00Z"),
            repository.Schedule.NextRunAtUtc);
    }

    private static WeeklyReportScheduleService CreateService(
        LiftBatteryDbContext context,
        IWeeklyReportScheduleRepository repository,
        IWeeklyReportQueue queue)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection()
            .Build();
        return new WeeklyReportScheduleService(
            repository,
            queue,
            context,
            new FixedTimeProvider(DateTimeOffset.Parse("2026-07-07T01:00:00Z")),
            configuration,
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
            LocalSendTime = new TimeOnly(0, 0),
            TimeZoneId = "UTC",
            RecipientEmail = "test@example.com",
            NextRunAtUtc = nextRunAtUtc,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };
    }

    private sealed class FakeScheduleRepository : IWeeklyReportScheduleRepository
    {
        public FakeScheduleRepository(WeeklyReportSchedule schedule)
        {
            Schedule = schedule;
        }

        public WeeklyReportSchedule Schedule { get; private set; }
        public int ReleaseCount { get; private set; }

        public Task<WeeklyReportSchedule?> GetByUserIdAsync(
            int userId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<WeeklyReportSchedule?>(Schedule.UserId == userId ? Schedule : null);

        public Task<WeeklyReportSchedule?> GetByIdAsync(
            string scheduleId,
            CancellationToken cancellationToken = default) =>
            Task.FromResult<WeeklyReportSchedule?>(Schedule.ScheduleId == scheduleId ? Schedule : null);

        public Task<WeeklyReportSchedule> UpsertForUserAsync(
            WeeklyReportSchedule schedule,
            CancellationToken cancellationToken = default)
        {
            Schedule = schedule;
            return Task.FromResult(schedule);
        }

        public Task<IReadOnlyList<WeeklyReportScheduleClaim>> ClaimDueAsync(
            DateTimeOffset nowUtc,
            DateTimeOffset leaseUntilUtc,
            string dispatcherId,
            int batchSize,
            CancellationToken cancellationToken = default)
        {
            if (!Schedule.Enabled
                || Schedule.NextRunAtUtc is null
                || Schedule.NextRunAtUtc > nowUtc
                || Schedule.LeaseUntilUtc >= nowUtc)
            {
                return Task.FromResult<IReadOnlyList<WeeklyReportScheduleClaim>>(Array.Empty<WeeklyReportScheduleClaim>());
            }

            var token = $"{dispatcherId}:claim";
            Schedule.LeaseUntilUtc = leaseUntilUtc;
            Schedule.ClaimedBy = token;
            return Task.FromResult<IReadOnlyList<WeeklyReportScheduleClaim>>(
                new[] { new WeeklyReportScheduleClaim(Schedule, token) });
        }

        public Task<bool> SetClaimedPeriodAsync(
            string scheduleId,
            string claimToken,
            string periodKey,
            CancellationToken cancellationToken = default)
        {
            if (Schedule.ScheduleId != scheduleId || Schedule.ClaimedBy != claimToken)
            {
                return Task.FromResult(false);
            }

            Schedule.ClaimedPeriodKey = periodKey;
            return Task.FromResult(true);
        }

        public Task ReleaseClaimAsync(
            string scheduleId,
            string claimToken,
            CancellationToken cancellationToken = default)
        {
            ReleaseCount++;
            Schedule.LeaseUntilUtc = null;
            Schedule.ClaimedBy = null;
            Schedule.ClaimedPeriodKey = null;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeWeeklyReportQueue : IWeeklyReportQueue
    {
        public List<WeeklyReportQueueMessageDto> Messages { get; } = new();
        public bool ThrowOnEnqueue { get; init; }

        public Task EnqueueAsync(
            WeeklyReportQueueMessageDto queueMessage,
            CancellationToken cancellationToken = default)
        {
            if (ThrowOnEnqueue)
            {
                throw new InvalidOperationException("Queue unavailable.");
            }

            Messages.Add(queueMessage);
            return Task.CompletedTask;
        }
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
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
            var context = new LiftBatteryDbContext(
                new DbContextOptionsBuilder<LiftBatteryDbContext>()
                    .UseSqlite(connection)
                    .Options);
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
