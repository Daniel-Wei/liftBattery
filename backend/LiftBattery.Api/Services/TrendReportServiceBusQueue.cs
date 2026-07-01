using System.Text.Json;
using Azure.Messaging.ServiceBus;
using LiftBattery.Api.DTOs;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Services;

public sealed class TrendReportServiceBusQueue : ITrendReportServiceBusQueue, IAsyncDisposable
{
    private static readonly JsonSerializerOptions QueueMessageJsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration;
    private ServiceBusClient? _client;
    private ServiceBusSender? _sender;

    public TrendReportServiceBusQueue(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Sends a self-describing JSON message so the queue record is useful in Azure Portal,
    // logs, retry investigations, and DLQ debugging.
    public async Task EnqueueAsync(TrendReportQueueMessageDto queueMessage)
    {
        var sender = GetSender();
        var body = JsonSerializer.Serialize(queueMessage, QueueMessageJsonOptions);
        var message = new ServiceBusMessage(body)
        {
            MessageId = CreateMessageId(queueMessage),
            CorrelationId = queueMessage.RunId,
            ContentType = "application/json",
            Subject = "TrendReportRequested",
        };
        message.ApplicationProperties["jobType"] = "TrendReport";
        message.ApplicationProperties["runId"] = queueMessage.RunId;
        message.ApplicationProperties["jobId"] = queueMessage.JobId;
        message.ApplicationProperties["userId"] = queueMessage.UserId;
        message.ApplicationProperties["periodStart"] = queueMessage.PeriodStart;
        message.ApplicationProperties["periodEnd"] = queueMessage.PeriodEnd;
        message.ApplicationProperties["dataVersion"] = queueMessage.DataVersion;
        await sender.SendMessageAsync(message);
    }

    public async ValueTask DisposeAsync()
    {
        if (_sender is not null)
        {
            await _sender.DisposeAsync();
        }

        if (_client is not null)
        {
            await _client.DisposeAsync();
        }
    }

    private ServiceBusSender GetSender()
    {
        if (_sender is not null)
        {
            return _sender;
        }

        var connectionString = _configuration["ServiceBusConnection"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("ServiceBusConnection is required.");
        }

        var queueName = _configuration["TrendReportQueueName"] ?? "trend-report-jobs";
        _client = new ServiceBusClient(connectionString);
        _sender = _client.CreateSender(queueName);
        return _sender;
    }

    private static string CreateMessageId(TrendReportQueueMessageDto queueMessage)
    {
        return $"trend-report:{queueMessage.UserId}:{queueMessage.PeriodStart}:v{queueMessage.DataVersion}";
    }
}
