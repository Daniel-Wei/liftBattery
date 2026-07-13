using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Functions;

public sealed class TrendReportQueueFunctions
{
    private static readonly JsonSerializerOptions QueueMessageJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ITrendReportService _service;
    private readonly ILogger<TrendReportQueueFunctions> _logger;

    public TrendReportQueueFunctions(
        ITrendReportService service,
        ILogger<TrendReportQueueFunctions> logger)
    {
        _service = service;
        _logger = logger;
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
    // Invalid permanent messages go straight to DLQ; transient failures are thrown so Service Bus can retry.
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

        await _service.ProcessAsync(queueMessage, cancellationToken);
        await messageActions.CompleteMessageAsync(message, cancellationToken);
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
        return queueMessage.JobId > 0
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
