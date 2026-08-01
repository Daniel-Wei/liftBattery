using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Services;

public sealed class WeeklyReportServiceBusQueue : IWeeklyReportQueue, IAsyncDisposable
{
    private static readonly JsonSerializerOptions QueueMessageJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration;
    private ServiceBusClient? _client;
    private ServiceBusSender? _sender;

    public WeeklyReportServiceBusQueue(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task EnqueueAsync(
        WeeklyReportQueueMessageDto queueMessage,
        CancellationToken cancellationToken = default)
    {
        var sender = GetSender();
        var body = JsonSerializer.Serialize(queueMessage, QueueMessageJsonOptions);
        var idempotencyKey = $"{queueMessage.ScheduleId}:{queueMessage.PeriodKey}";
        var message = new ServiceBusMessage(body)
        {
            // A fresh broker MessageId allows the Timer to republish after a crashed
            // worker and expired schedule lease, even when Service Bus duplicate
            // detection is enabled. SQL Delivery owns business idempotency instead.
            MessageId = Guid.NewGuid().ToString("N"),
            CorrelationId = idempotencyKey,
            ContentType = "application/json",
            Subject = WeeklyReportConstants.MessageType,
        };
        message.ApplicationProperties["messageType"] = WeeklyReportConstants.MessageType;
        message.ApplicationProperties["reportType"] = WeeklyReportConstants.ReportType;
        message.ApplicationProperties["scheduleId"] = queueMessage.ScheduleId;
        message.ApplicationProperties["periodKey"] = queueMessage.PeriodKey;
        message.ApplicationProperties["idempotencyKey"] = idempotencyKey;
        await sender.SendMessageAsync(message, cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        if (_sender is not null) await _sender.DisposeAsync();
        if (_client is not null) await _client.DisposeAsync();
    }

    private ServiceBusSender GetSender()
    {
        if (_sender is not null) return _sender;

        var connectionString = _configuration["ServiceBusConnection"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("ServiceBusConnection is required.");
        }

        var queueName = _configuration["WeeklyReportQueueName"] ?? "weekly-report-jobs";
        _client = new ServiceBusClient(connectionString);
        _sender = _client.CreateSender(queueName);
        return _sender;
    }
}
