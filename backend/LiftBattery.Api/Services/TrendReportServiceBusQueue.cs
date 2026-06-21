using Azure.Messaging.ServiceBus;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Services;

public sealed class TrendReportServiceBusQueue : ITrendReportQueue, IAsyncDisposable
{
    private readonly IConfiguration _configuration;
    private ServiceBusClient? _client;
    private ServiceBusSender? _sender;

    public TrendReportServiceBusQueue(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // Creates a small message containing the job ID and sends it to the configured queue.
    public async Task EnqueueAsync(string jobId)
    {
        var sender = GetSender();
        var message = new ServiceBusMessage(jobId)
        {
            MessageId = jobId,
            ContentType = "text/plain",
            Subject = "TrendReportRequested",
        };
        message.ApplicationProperties["jobType"] = "TrendReport";
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
}
