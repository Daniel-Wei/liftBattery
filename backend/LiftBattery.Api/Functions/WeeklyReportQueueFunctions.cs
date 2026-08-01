using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace LiftBattery.Api.Functions;

public sealed class WeeklyReportQueueFunctions
{
    private static readonly JsonSerializerOptions QueueMessageJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IWeeklyReportSchedulingService _schedulingService;
    private readonly IWeeklyReportJobService _jobService;
    private readonly ILogger<WeeklyReportQueueFunctions> _logger;

    public WeeklyReportQueueFunctions(
        IWeeklyReportSchedulingService schedulingService,
        IWeeklyReportJobService jobService,
        ILogger<WeeklyReportQueueFunctions> logger)
    {
        _schedulingService = schedulingService;
        _jobService = jobService;
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

        return _schedulingService.ProcessDueSchedulesAsync(cancellationToken);
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
            "Processing weekly report queue message. MessageId={MessageId}, CorrelationId={CorrelationId}, ScheduleId={ScheduleId}, PeriodKey={PeriodKey}, DeliveryCount={DeliveryCount}.",
            message.MessageId,
            message.CorrelationId,
            queueMessage.ScheduleId,
            queueMessage.PeriodKey,
            message.DeliveryCount);

        await _jobService.ProcessAsync(queueMessage, cancellationToken);
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
        return !string.IsNullOrWhiteSpace(queueMessage.ScheduleId)
            && WeeklyReportPeriod.TryParse(queueMessage.PeriodKey, out _);
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
