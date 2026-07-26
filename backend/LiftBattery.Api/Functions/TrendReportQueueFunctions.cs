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
    private const int DefaultQueuedJobTimeoutMinutes = 15;
    private const int DefaultProcessingJobTimeoutMinutes = 30;
    private static readonly JsonSerializerOptions QueueMessageJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ITrendReportService _service;
    private readonly ILogger<TrendReportQueueFunctions> _logger;
    private readonly TimeSpan _queuedJobTimeout;
    private readonly TimeSpan _processingJobTimeout;

    public TrendReportQueueFunctions(
        ITrendReportService service,
        ILogger<TrendReportQueueFunctions> logger,
        IConfiguration configuration)
    {
        _service = service;
        _logger = logger;
        _queuedJobTimeout = TimeSpan.FromMinutes(ParsePositiveIntSetting(
            configuration["TrendReportQueuedJobTimeoutMinutes"],
            DefaultQueuedJobTimeoutMinutes));
        _processingJobTimeout = TimeSpan.FromMinutes(ParsePositiveIntSetting(
            configuration["TrendReportProcessingJobTimeoutMinutes"],
            DefaultProcessingJobTimeoutMinutes));
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

    [Function("ConvergeTimedOutTrendReportJobs")]
    public async Task ConvergeTimedOutTrendReportJobs(
        [TimerTrigger("%TrendReportJobConvergenceTimer%")] TimerInfo timerInfo,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var convergedCount = await _service.ConvergeTimedOutJobsAsync(
            queuedBeforeUtc: now - _queuedJobTimeout,
            processingBeforeUtc: now - _processingJobTimeout,
            maxCount: 50,
            cancellationToken);

        if (convergedCount > 0)
        {
            _logger.LogWarning(
                "Converged timed-out trend report jobs. Count={ConvergedCount}, Last={Last}, Next={Next}.",
                convergedCount,
                timerInfo.ScheduleStatus?.Last,
                timerInfo.ScheduleStatus?.Next);
        }
    }

    // Azure Functions invokes this when a queue message is available, including redeliveries.
    // Permanently invalid messages go straight to DLQ. Every valid-message processing
    // failure escapes for broker-controlled redelivery and eventual automatic DLQ.
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

        // Success and intentional stale/terminal no-ops are completed. Any exception
        // leaves the valid message unsettled so Service Bus controls the retry budget.
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
        return queueMessage.JobId != Guid.Empty
            && queueMessage.UserId > 0
            && !string.IsNullOrWhiteSpace(queueMessage.RunId)
            && !string.IsNullOrWhiteSpace(queueMessage.PeriodStart)
            && !string.IsNullOrWhiteSpace(queueMessage.PeriodEnd)
            && !string.IsNullOrWhiteSpace(queueMessage.DataVersion);
    }

    private static int ParsePositiveIntSetting(string? value, int defaultValue)
    {
        return int.TryParse(value, out var configuredValue)
            ? Math.Max(1, configuredValue)
            : defaultValue;
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
