using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Functions;

public sealed class WeeklyReportQueueFunctions
{
    private static readonly JsonSerializerOptions QueueMessageJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IWeeklyReportScheduleService _service;
    private readonly ILogger<WeeklyReportQueueFunctions> _logger;

    public WeeklyReportQueueFunctions(
        IWeeklyReportScheduleService service,
        ILogger<WeeklyReportQueueFunctions> logger)
    {
        _service = service;
        _logger = logger;
    }

    [Function("EnqueueDueWeeklyReports")]
    public Task EnqueueDueWeeklyReports(
        [TimerTrigger("%WeeklyReportScheduleTimer%")] TimerInfo timerInfo,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Checking due weekly report schedules. Last={Last}, Next={Next}.",
            timerInfo.ScheduleStatus?.Last,
            timerInfo.ScheduleStatus?.Next);

        return _service.EnqueueDueReportsAsync(cancellationToken);
    }

    [Function("ProcessWeeklyReportJob")]
    public async Task ProcessWeeklyReportJob(
        [ServiceBusTrigger("%WeeklyReportQueueName%", Connection = "ServiceBusConnection", AutoCompleteMessages = false)] ServiceBusReceivedMessage message,
        ServiceBusMessageActions messageActions,
        CancellationToken cancellationToken)
    {
        var queueMessage = TryReadQueueMessage(message);

        if (queueMessage is null)
        {
            await DeadLetterInvalidMessageAsync(
                message,
                messageActions,
                "InvalidWeeklyReportQueueMessage",
                "The message body must be a valid WeeklyReportQueueMessageDto JSON payload.",
                cancellationToken);
            return;
        }

        if (!IsValidQueueMessage(queueMessage))
        {
            await DeadLetterInvalidMessageAsync(
                message,
                messageActions,
                "InvalidWeeklyReportQueueMessage",
                "The message body is valid JSON, but required weekly report fields are missing or invalid.",
                cancellationToken);
            return;
        }

        _logger.LogInformation(
            "Processing weekly report queue message. MessageId={MessageId}, CorrelationId={CorrelationId}, IdempotencyKey={IdempotencyKey}, UserId={UserId}, DataVersion={DataVersion}, DeliveryCount={DeliveryCount}.",
            message.MessageId,
            message.CorrelationId,
            queueMessage.IdempotencyKey,
            queueMessage.UserId,
            queueMessage.DataVersion,
            message.DeliveryCount);

        await _service.ProcessAsync(queueMessage, cancellationToken);
        await messageActions.CompleteMessageAsync(message, cancellationToken);
    }

    private static WeeklyReportQueueMessageDto? TryReadQueueMessage(ServiceBusReceivedMessage message)
    {
        try
        {
            return JsonSerializer.Deserialize<WeeklyReportQueueMessageDto>(
                message.Body.ToString(),
                QueueMessageJsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static bool IsValidQueueMessage(WeeklyReportQueueMessageDto queueMessage)
    {
        return queueMessage.DataVersion > 0
            && queueMessage.UserId > 0
            && queueMessage.MessageType == "WeeklyTrendsReportRequested"
            && queueMessage.ReportType == "WeeklyTrendsReport"
            && !string.IsNullOrWhiteSpace(queueMessage.WeekStartDate)
            && !string.IsNullOrWhiteSpace(queueMessage.WeekEndDate)
            && !string.IsNullOrWhiteSpace(queueMessage.IdempotencyKey)
            && !string.IsNullOrWhiteSpace(queueMessage.CorrelationId)
            && !string.IsNullOrWhiteSpace(queueMessage.RecipientEmail);
    }

    private async Task DeadLetterInvalidMessageAsync(
        ServiceBusReceivedMessage message,
        ServiceBusMessageActions messageActions,
        string reason,
        string description,
        CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Dead-lettering invalid weekly report queue message. MessageId={MessageId}, CorrelationId={CorrelationId}, Reason={Reason}.",
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
