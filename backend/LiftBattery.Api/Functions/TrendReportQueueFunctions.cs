using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Functions;

public sealed class TrendReportQueueFunctions
{
    private const int DefaultMaxDeliveryCount = 10;
    private static readonly JsonSerializerOptions QueueMessageJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ITrendReportService _service;
    private readonly ILogger<TrendReportQueueFunctions> _logger;
    private readonly int _maxDeliveryCount;

    public TrendReportQueueFunctions(
        ITrendReportService service,
        ILogger<TrendReportQueueFunctions> logger,
        IConfiguration configuration)
    {
        _service = service;
        _logger = logger;
        _maxDeliveryCount = int.TryParse(
            configuration["TrendReportMaxDeliveryCount"],
            out var configuredMaxDeliveryCount)
                ? Math.Max(1, configuredMaxDeliveryCount)
                : DefaultMaxDeliveryCount;
    }

    [Function("RecoverPendingTrendReportEnqueues")]
    public async Task RecoverPendingTrendReportEnqueues(
        [TimerTrigger("%TrendReportEnqueueRecoveryTimer%")] TimerInfo timerInfo,
        CancellationToken cancellationToken)
    {
        var cutoffUtc = DateTimeOffset.UtcNow.AddMinutes(-2);
        var recoveredCount = await _service.RecoverUnstartedEnqueuesAsync(
            cutoffUtc,
            maxCount: 50,
            cancellationToken);

        if (recoveredCount > 0)
        {
            _logger.LogWarning(
                "Recovered unstarted trend report enqueue jobs. Count={RecoveredCount}, CutoffUtc={CutoffUtc}, Last={Last}, Next={Next}.",
                recoveredCount,
                cutoffUtc,
                timerInfo.ScheduleStatus?.Last,
                timerInfo.ScheduleStatus?.Next);
        }
    }

    // Azure Functions invokes this when a queue message is available, including redeliveries.
    // Invalid messages go straight to DLQ. Transient failures are thrown for redelivery;
    // the configured final delivery marks the job Failed and is explicitly dead-lettered.
    [Function("ProcessTrendReportJob")]
    public async Task ProcessTrendReportJob(
        [ServiceBusTrigger("%TrendReportQueueName%", Connection = "ServiceBusConnection", AutoCompleteMessages = false)] ServiceBusReceivedMessage message,
        ServiceBusMessageActions messageActions,
        CancellationToken cancellationToken)
    {
        var queueMessage = TryReadQueueMessage(message);

        if (queueMessage is null)
        {
            await DeadLetterInvalidMessageAsync(
                message,
                messageActions,
                "InvalidTrendReportQueueMessage",
                "The message body must be a valid TrendReportQueueMessageDto JSON payload.",
                cancellationToken);
            return;
        }

        if (!IsValidQueueMessage(queueMessage))
        {
            await DeadLetterInvalidMessageAsync(
                message,
                messageActions,
                "InvalidTrendReportQueueMessage",
                "The message body is valid JSON, but required trend report fields are missing or invalid.",
                cancellationToken);
            return;
        }

        _logger.LogInformation(
            "Processing trend report queue message. MessageId={MessageId}, CorrelationId={CorrelationId}, RunId={RunId}, JobId={JobId}, DataVersion={DataVersion}, DeliveryCount={DeliveryCount}.",
            message.MessageId,
            message.CorrelationId,
            queueMessage.RunId,
            queueMessage.JobId,
            queueMessage.DataVersion,
            message.DeliveryCount);

        var processingContext = new TrendReportProcessingContext(
            DeliveryCount: Math.Max(1, message.DeliveryCount),
            MaxDeliveryCount: _maxDeliveryCount);

        try
        {
            await _service.ProcessAsync(
                queueMessage,
                processingContext,
                cancellationToken);
            await messageActions.CompleteMessageAsync(message, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // Host shutdown and lost invocation cancellation are retryable regardless
            // of DeliveryCount, so never convert cancellation into a terminal failure.
            throw;
        }
        catch (Exception exception) when (processingContext.IsFinalDelivery)
        {
            _logger.LogError(
                exception,
                "Dead-lettering trend report after retry budget was exhausted. MessageId={MessageId}, CorrelationId={CorrelationId}, RunId={RunId}, JobId={JobId}, DeliveryCount={DeliveryCount}, MaxDeliveryCount={MaxDeliveryCount}.",
                message.MessageId,
                message.CorrelationId,
                queueMessage.RunId,
                queueMessage.JobId,
                message.DeliveryCount,
                _maxDeliveryCount);

            await messageActions.DeadLetterMessageAsync(
                message,
                new Dictionary<string, object>(),
                "TrendReportRetryLimitExceeded",
                $"Trend report processing failed after {message.DeliveryCount} deliveries.",
                cancellationToken);
        }
    }

    private static TrendReportQueueMessageDto? TryReadQueueMessage(ServiceBusReceivedMessage message)
    {
        try
        {
            return JsonSerializer.Deserialize<TrendReportQueueMessageDto>(
                message.Body.ToString(),
                QueueMessageJsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static bool IsValidQueueMessage(TrendReportQueueMessageDto queueMessage)
    {
        return queueMessage.JobId != Guid.Empty
            && queueMessage.UserId > 0
            && !string.IsNullOrWhiteSpace(queueMessage.RunId)
            && !string.IsNullOrWhiteSpace(queueMessage.PeriodStart)
            && !string.IsNullOrWhiteSpace(queueMessage.PeriodEnd)
            && !string.IsNullOrWhiteSpace(queueMessage.DataVersion);
    }

    private async Task DeadLetterInvalidMessageAsync(
        ServiceBusReceivedMessage message,
        ServiceBusMessageActions messageActions,
        string reason,
        string description,
        CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Dead-lettering invalid trend report queue message. MessageId={MessageId}, CorrelationId={CorrelationId}, Reason={Reason}.",
            message.MessageId,
            message.CorrelationId,
            reason);

        await messageActions.DeadLetterMessageAsync(
            message,
            new Dictionary<string, object>(),
            reason,
            description,
            cancellationToken);
    }
}
