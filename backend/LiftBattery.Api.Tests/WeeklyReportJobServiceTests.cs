using LiftBattery.Api.Data;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Entities;
using LiftBattery.Api.Models;
using LiftBattery.Api.Repositories;
using LiftBattery.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LiftBattery.Api.Tests;

public sealed class WeeklyReportJobServiceTests
{
    [Fact]
    public async Task EmailFailureRetryReusesBlobAndSentDuplicateIsNoOp()
    {
        await using var database = await TestDatabase.CreateAsync();
        var now = DateTimeOffset.Parse("2026-07-07T01:00:00Z");
        var period = new WeeklyReportPeriod(
            new DateOnly(2026, 6, 30),
            new DateOnly(2026, 7, 6));
        await SeedAsync(database.Context, now, period.Key);

        var source = new FakeSourceDataRepository();
        var pdf = new FakePdfGenerator();
        var blobs = new FakeBlobStorage();
        var email = new FakeEmailSender { FailuresRemaining = 1 };
        var service = CreateService(database.Context, source, pdf, blobs, email, now);
        var message = new WeeklyReportQueueMessageDto("weekly-report-user-1", period.Key);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ProcessAsync(message));
        await service.ProcessAsync(message);
        await service.ProcessAsync(message);

        Assert.Equal(1, source.CaptureCount);
        Assert.Equal(1, pdf.GenerateCount);
        Assert.Equal(1, blobs.UploadCount);
        Assert.Equal(2, email.SendCount);
        Assert.All(email.IdempotencyKeys, key => Assert.Equal(
            $"weekly-report-user-1:{period.Key}",
            key));

        var delivery = await database.Context.WeeklyReportDeliveries
            .AsNoTracking()
            .SingleAsync();
        Assert.Equal(WeeklyReportDeliveryStatuses.Sent, delivery.Status);
        Assert.Equal("v1", delivery.SourceDataVersion);
        Assert.NotNull(delivery.BlobPath);
        Assert.NotNull(delivery.SentAtUtc);

        var schedule = await database.Context.WeeklyReportSchedules
            .AsNoTracking()
            .SingleAsync();
        Assert.Equal(period.Key, schedule.LastPeriodKey);
        Assert.True(schedule.NextRunAtUtc > now);
        Assert.Null(schedule.LeaseUntilUtc);
    }

    private static WeeklyReportJobService CreateService(
        LiftBatteryDbContext context,
        FakeSourceDataRepository source,
        FakePdfGenerator pdf,
        FakeBlobStorage blobs,
        FakeEmailSender email,
        DateTimeOffset now)
    {
        return new WeeklyReportJobService(
            new WeeklyReportScheduleSqlRepository(context),
            new WeeklyReportDeliveryRepository(context),
            source,
            pdf,
            blobs,
            email,
            new FixedTimeProvider(now),
            new ConfigurationBuilder().AddInMemoryCollection().Build(),
            NullLogger<WeeklyReportJobService>.Instance);
    }

    private static async Task SeedAsync(
        LiftBatteryDbContext context,
        DateTimeOffset now,
        string periodKey)
    {
        context.Users.Add(new User
        {
            DisplayName = "Test",
            Email = "test@example.com",
            NormalizedEmail = "TEST@EXAMPLE.COM",
            PasswordHash = "hash",
            TrendReportDataVersion = "v1",
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        });
        await context.SaveChangesAsync();
        context.WeeklyReportSchedules.Add(new WeeklyReportSchedule
        {
            ScheduleId = "weekly-report-user-1",
            UserId = 1,
            Enabled = true,
            DayOfWeek = DayOfWeek.Tuesday,
            LocalSendTime = new TimeOnly(0, 0),
            TimeZoneId = "UTC",
            RecipientEmail = "latest@example.com",
            NextRunAtUtc = DateTimeOffset.Parse("2026-07-07T00:00:00Z"),
            LeaseUntilUtc = now.AddMinutes(10),
            ClaimedBy = "timer:claim",
            ClaimedPeriodKey = periodKey,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        });
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
    }

    private sealed class FakeSourceDataRepository : ITrendReportSourceDataRepository
    {
        public int CaptureCount { get; private set; }

        public Task StageDataVersionChangeAsync(
            int userId,
            DateTimeOffset updatedAtUtc,
            CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<TrendReportSourceDataCapture> CaptureSnapshotAsync(
            int userId,
            DateOnly from,
            DateOnly to,
            CancellationToken cancellationToken = default)
        {
            CaptureCount++;
            return Task.FromResult(new TrendReportSourceDataCapture(
                "v1",
                new TrendReportReqSnapshot(
                    Array.Empty<TrainingDayModel>(),
                    Array.Empty<PreCheckModel>())));
        }

        public Task<string?> GetCurrentDataVersionAsync(
            int userId,
            CancellationToken cancellationToken = default) => Task.FromResult<string?>("v1");
    }

    private sealed class FakePdfGenerator : IWeeklyReportPdfGenerator
    {
        public int GenerateCount { get; private set; }

        public byte[] GeneratePdf(TrendReportResultDto report, WeeklyReportPdfMetadata metadata)
        {
            GenerateCount++;
            return new byte[] { 1, 2, 3 };
        }
    }

    private sealed class FakeBlobStorage : IWeeklyReportBlobStorage
    {
        private const string Path = "schedules/weekly-report-user-1/report.pdf";
        private byte[]? _content;
        public int UploadCount { get; private set; }

        public Task<WeeklyReportBlob?> GetIfExistsAsync(
            string scheduleId,
            string periodKey,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(_content is null ? null : new WeeklyReportBlob(Path, _content));

        public Task<byte[]> DownloadAsync(
            string blobPath,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(_content ?? throw new InvalidOperationException("Blob missing."));

        public Task<string> UploadAsync(
            string scheduleId,
            string periodKey,
            WeeklyReportPdfMetadata metadata,
            byte[] pdfBytes,
            CancellationToken cancellationToken = default)
        {
            UploadCount++;
            _content = pdfBytes;
            return Task.FromResult(Path);
        }
    }

    private sealed class FakeEmailSender : IEmailSender
    {
        public int FailuresRemaining { get; set; }
        public int SendCount { get; private set; }
        public List<string> IdempotencyKeys { get; } = new();

        public Task SendAsync(
            string recipientEmail,
            string subject,
            string body,
            string idempotencyKey,
            EmailAttachment attachment,
            CancellationToken cancellationToken = default)
        {
            SendCount++;
            IdempotencyKeys.Add(idempotencyKey);
            if (FailuresRemaining-- > 0)
            {
                throw new InvalidOperationException("SMTP unavailable.");
            }

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
