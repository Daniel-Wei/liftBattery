using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Azure.Core.Serialization;
using LiftBattery.Api.Data;
using LiftBattery.Api.Data.Entities;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Functions;
using LiftBattery.Api.Options;
using LiftBattery.Api.Repositories;
using LiftBattery.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xunit;

namespace LiftBattery.Api.Tests;

public sealed class PreCheckPersistenceTests
{
    private static readonly DateOnly TestDate = new(2026, 6, 21);

    [Fact]
    public async Task SavingNewDateCreatesRecord()
    {
        await using var database = await TestDatabase.CreateAsync();
        var service = database.CreateService();

        var saved = await service.SaveAsync("user-a", CreateDto());

        Assert.NotNull(saved.Id);
        Assert.Equal(1, await database.Context.PreChecks.CountAsync());
    }

    [Fact]
    public async Task SavingSameUserAndDateUpdatesExistingRecord()
    {
        await using var database = await TestDatabase.CreateAsync();
        var service = database.CreateService();
        var first = await service.SaveAsync("user-a", CreateDto());
        var changedDto = CreateDto() with { SleepHours = 9, MotivationRating = 9 };

        var updated = await service.SaveAsync("user-a", changedDto);

        Assert.Equal(first.Id, updated.Id);
        Assert.Equal(9, updated.SleepHours);
        Assert.Equal(9, updated.MotivationRating);
        Assert.Equal(1, await database.Context.PreChecks.CountAsync());
    }

    [Fact]
    public async Task UniqueIndexRejectsDuplicateUserDate()
    {
        await using var database = await TestDatabase.CreateAsync();
        database.Context.PreChecks.AddRange(
            CreateEntity("first", "user-a"),
            CreateEntity("second", "user-a"));

        await Assert.ThrowsAsync<DbUpdateException>(
            () => database.Context.SaveChangesAsync());
    }

    [Fact]
    public async Task DifferentUsersCanSaveSameDate()
    {
        await using var database = await TestDatabase.CreateAsync();
        var service = database.CreateService();

        await service.SaveAsync("user-a", CreateDto());
        await service.SaveAsync("user-b", CreateDto());

        Assert.Equal(2, await database.Context.PreChecks.CountAsync());
    }

    [Fact]
    public async Task ReadsByUserAndDate()
    {
        await using var database = await TestDatabase.CreateAsync();
        var service = database.CreateService();
        await service.SaveAsync("user-a", CreateDto());

        var found = await service.GetByDateAsync("user-a", TestDate);
        var missingForOtherUser = await service.GetByDateAsync("user-b", TestDate);

        Assert.NotNull(found);
        Assert.Null(missingForOtherUser);
    }

    [Fact]
    public async Task SavedDataCanBeReadFromANewDbContext()
    {
        await using var database = await TestDatabase.CreateAsync();
        await database.CreateService().SaveAsync("user-a", CreateDto());

        await using var secondContext = new LiftBatteryDbContext(database.Options);
        var secondRepository = new PreCheckRepository(
            secondContext,
            Microsoft.Extensions.Options.Options.Create(new PreCheckOptions()));
        var secondService = new PreCheckService(secondRepository, TimeProvider.System);
        var reloaded = await secondService.GetByDateAsync("user-a", TestDate);

        Assert.NotNull(reloaded);
        Assert.Equal(7.5m, reloaded.SleepHours);
        Assert.Equal(65, reloaded.PreviousSessionDurationMinutes);
    }

    [Fact]
    public async Task InvalidRequestPayloadIsRejected()
    {
        await using var database = await TestDatabase.CreateAsync();
        var invalidDto = CreateDto() with { SleepHours = 13 };

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => database.CreateService().SaveAsync("user-a", invalidDto));

        Assert.Contains("SleepHours", exception.Message);
    }

    [Fact]
    public async Task InvalidHttpRequestReturnsBadRequest()
    {
        await using var database = await TestDatabase.CreateAsync();
        var functions = new PreCheckFunctions(
            database.CreateService(),
            Microsoft.Extensions.Options.Options.Create(new PreCheckOptions()));
        var request = TestHttpRequestData.Create("{");

        var response = await functions.SavePreCheck(request, CancellationToken.None);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        response.Body.Position = 0;
        var body = await new StreamReader(response.Body).ReadToEndAsync();
        Assert.Contains("invalid JSON", body);
    }

    private static PreCheckDto CreateDto()
    {
        return new PreCheckDto(
            null,
            TestDate.ToString("yyyy-MM-dd"),
            4,
            2,
            2,
            4,
            4,
            7.5m,
            4,
            8,
            3,
            8,
            65);
    }

    private static PreCheck CreateEntity(string id, string userId)
    {
        var now = DateTimeOffset.UtcNow;
        return new PreCheck
        {
            Id = id,
            UserId = userId,
            PreCheckDate = TestDate,
            SleepHours = 7.5m,
            Soreness = 4,
            Motivation = 8,
            RestingHeartRateDelta = 3,
            PreviousSessionRpe = 8,
            PreviousSessionDurationMinutes = 65,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
        };
    }

    private sealed class TestDatabase : IAsyncDisposable
    {
        private readonly SqliteConnection _connection;

        private TestDatabase(
            SqliteConnection connection,
            DbContextOptions<LiftBatteryDbContext> options,
            LiftBatteryDbContext context)
        {
            _connection = connection;
            Options = options;
            Context = context;
        }

        public DbContextOptions<LiftBatteryDbContext> Options { get; }

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
            return new TestDatabase(connection, options, context);
        }

        public PreCheckService CreateService()
        {
            var repository = new PreCheckRepository(
                Context,
                Microsoft.Extensions.Options.Options.Create(new PreCheckOptions()));
            return new PreCheckService(repository, TimeProvider.System);
        }

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
            await _connection.DisposeAsync();
        }
    }

    private sealed class TestFunctionContext : FunctionContext
    {
        public override string InvocationId => "test-invocation";

        public override string FunctionId => "SavePreCheck";

        public override TraceContext TraceContext => null!;

        public override BindingContext BindingContext => null!;

        public override RetryContext RetryContext => null!;

        public override IServiceProvider InstanceServices { get; set; } = null!;

        public override FunctionDefinition FunctionDefinition => null!;

        public override IDictionary<object, object> Items { get; set; } =
            new Dictionary<object, object>();

        public override IInvocationFeatures Features => null!;
    }

    private sealed class TestHttpRequestData : HttpRequestData
    {
        private TestHttpRequestData(FunctionContext functionContext, Stream body)
            : base(functionContext)
        {
            Body = body;
        }

        public override Stream Body { get; }

        public override HttpHeadersCollection Headers { get; } = new();

        public override IReadOnlyCollection<IHttpCookie> Cookies { get; } =
            Array.Empty<IHttpCookie>();

        public override Uri Url { get; } = new("http://localhost/api/precheck");

        public override IEnumerable<ClaimsIdentity> Identities { get; } =
            Array.Empty<ClaimsIdentity>();

        public override string Method => "POST";

        public static TestHttpRequestData Create(string body)
        {
            var services = new ServiceCollection();
            services.Configure<WorkerOptions>(options =>
            {
                options.Serializer = new JsonObjectSerializer(new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    PropertyNameCaseInsensitive = true,
                });
            });
            var context = new TestFunctionContext
            {
                InstanceServices = services.BuildServiceProvider(),
            };
            return new TestHttpRequestData(
                context,
                new MemoryStream(Encoding.UTF8.GetBytes(body)));
        }

        public override HttpResponseData CreateResponse()
        {
            return new TestHttpResponseData(FunctionContext);
        }
    }

    private sealed class TestHttpResponseData : HttpResponseData
    {
        public TestHttpResponseData(FunctionContext functionContext)
            : base(functionContext)
        {
        }

        public override HttpStatusCode StatusCode { get; set; }

        public override HttpHeadersCollection Headers { get; set; } = new();

        public override Stream Body { get; set; } = new MemoryStream();

        public override HttpCookies Cookies => null!;
    }
}
