using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Functions;
using LiftBattery.Api.Models;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LiftBattery.Api.Tests;

public sealed class TrendReportQueueFunctionTests
{
    [Fact]
    public async Task NonFinalFailureIsNotSettledSoServiceBusCanRedeliver()
    {
        var service = new FakeTrendReportService
        {
            ProcessException = new InvalidOperationException("Transient processing failure."),
        };
        var function = CreateFunction(service, maxDeliveryCount: 3);
        var messageActions = new RecordingServiceBusMessageActions();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            function.ProcessTrendReportJob(
                CreateMessage(deliveryCount: 2),
                messageActions,
                CancellationToken.None));

        Assert.Equal(0, messageActions.CompleteCount);
        Assert.Equal(0, messageActions.DeadLetterCount);
        Assert.Equal(2, service.LastProcessingContext?.DeliveryCount);
        Assert.False(service.LastProcessingContext?.IsFinalDelivery);
    }

    [Fact]
    public async Task FinalFailureIsExplicitlyDeadLettered()
    {
        var service = new FakeTrendReportService
        {
            ProcessException = new InvalidOperationException("Final processing failure."),
        };
        var function = CreateFunction(service, maxDeliveryCount: 3);
        var messageActions = new RecordingServiceBusMessageActions();

        await function.ProcessTrendReportJob(
            CreateMessage(deliveryCount: 3),
            messageActions,
            CancellationToken.None);

        Assert.Equal(0, messageActions.CompleteCount);
        Assert.Equal(1, messageActions.DeadLetterCount);
        Assert.Equal("TrendReportRetryLimitExceeded", messageActions.DeadLetterReason);
        Assert.True(service.LastProcessingContext?.IsFinalDelivery);
    }

    [Fact]
    public async Task SuccessfulOrIdempotentNoOpProcessingCompletesMessage()
    {
        var service = new FakeTrendReportService();
        var function = CreateFunction(service, maxDeliveryCount: 3);
        var messageActions = new RecordingServiceBusMessageActions();

        await function.ProcessTrendReportJob(
            CreateMessage(deliveryCount: 2),
            messageActions,
            CancellationToken.None);

        Assert.Equal(1, messageActions.CompleteCount);
        Assert.Equal(0, messageActions.DeadLetterCount);
    }

    private static TrendReportQueueFunctions CreateFunction(
        ITrendReportService service,
        int maxDeliveryCount)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["TrendReportMaxDeliveryCount"] = maxDeliveryCount.ToString(),
            })
            .Build();

        return new TrendReportQueueFunctions(
            service,
            NullLogger<TrendReportQueueFunctions>.Instance,
            configuration);
    }

    private static ServiceBusReceivedMessage CreateMessage(int deliveryCount)
    {
        var queueMessage = new TrendReportQueueMessageDto(
            JobId: Guid.Parse("00000000-0000-0000-0000-000000000123"),
            RunId: "trend-report:test-run",
            UserId: 1,
            PeriodStart: "2026-07-06",
            PeriodEnd: "2026-07-12",
            DataVersion: "v1",
            RequestedAtUtc: DateTimeOffset.Parse("2026-07-06T00:00:00Z"));

        return ServiceBusModelFactory.ServiceBusReceivedMessage(
            body: BinaryData.FromString(JsonSerializer.Serialize(queueMessage)),
            messageId: "trend-report-test-message",
            correlationId: queueMessage.RunId,
            deliveryCount: deliveryCount);
    }

    private sealed class RecordingServiceBusMessageActions : ServiceBusMessageActions
    {
        public int CompleteCount { get; private set; }
        public int DeadLetterCount { get; private set; }
        public string? DeadLetterReason { get; private set; }

        public override Task CompleteMessageAsync(
            ServiceBusReceivedMessage message,
            CancellationToken cancellationToken)
        {
            CompleteCount++;
            return Task.CompletedTask;
        }

        public override Task DeadLetterMessageAsync(
            ServiceBusReceivedMessage message,
            Dictionary<string, object>? propertiesToModify,
            string? deadLetterReason,
            string? deadLetterErrorDescription,
            CancellationToken cancellationToken)
        {
            DeadLetterCount++;
            DeadLetterReason = deadLetterReason;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeTrendReportService : ITrendReportService
    {
        public Exception? ProcessException { get; init; }
        public TrendReportProcessingContext? LastProcessingContext { get; private set; }

        public Task ProcessAsync(
            TrendReportQueueMessageDto queueMessage,
            TrendReportProcessingContext processingContext,
            CancellationToken cancellationToken = default)
        {
            LastProcessingContext = processingContext;
            return ProcessException is null
                ? Task.CompletedTask
                : Task.FromException(ProcessException);
        }

        public Task<TrendReportJobDto> SubmitAsync(
            int userId,
            CreateTrendReportRequestDto request,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<TrendReportJobDto?> GetByIdAsync(int userId, Guid id) =>
            throw new NotSupportedException();

        public Task<TrendReportJobDto?> CancelAsync(
            int userId,
            Guid id,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public Task<TrendReportResultDto> GenerateResultAsync(
            int userId,
            CreateTrendReportRequestDto request) =>
            throw new NotSupportedException();

        public Task<int> RecoverUnstartedEnqueuesAsync(
            DateTimeOffset olderThanUtc,
            int maxCount,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();
    }
}
