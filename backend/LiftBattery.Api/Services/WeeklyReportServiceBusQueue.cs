using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LiftBattery.Api.DTOs;
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

    public async Task EnqueueAsync(WeeklyReportQueueMessageDto queueMessage)
    {
        var sender = GetSender();
        var body = JsonSerializer.Serialize(queueMessage, QueueMessageJsonOptions);
        var message = new ServiceBusMessage(body)
        {
            MessageId = queueMessage.IdempotencyKey,
            CorrelationId = queueMessage.CorrelationId,
            ContentType = "application/json",
            Subject = queueMessage.MessageType,
        };
        message.ApplicationProperties["messageType"] = queueMessage.MessageType;
        message.ApplicationProperties["reportType"] = queueMessage.ReportType;
        message.ApplicationProperties["userId"] = queueMessage.UserId;
        message.ApplicationProperties["weekStartDate"] = queueMessage.WeekStartDate;
        message.ApplicationProperties["weekEndDate"] = queueMessage.WeekEndDate;
        message.ApplicationProperties["dataVersion"] = queueMessage.DataVersion;
        await sender.SendMessageAsync(message);
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
