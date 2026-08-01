using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace LiftBattery.Api.Services;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;

    public SmtpEmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendAsync(
        string recipientEmail,
        string subject,
        string body,
        string idempotencyKey,
        EmailAttachment attachment,
        CancellationToken cancellationToken = default)
    {
        var host = _configuration["Email:SmtpHost"];
        var from = _configuration["Email:FromAddress"];

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
        {
            throw new InvalidOperationException("Email:SmtpHost and Email:FromAddress are required.");
        }

        using var message = new MailMessage(from, recipientEmail)
        {
            Subject = subject,
            Body = body,
        };
        // Providers that understand this key can suppress a resend after a worker
        // crash between SMTP acceptance and the SQL Sent transaction.
        message.Headers["X-Idempotency-Key"] = idempotencyKey;
        message.Attachments.Add(new Attachment(
            new MemoryStream(attachment.Content),
            attachment.FileName,
            attachment.ContentType));

        using var client = new SmtpClient(host)
        {
            Port = int.TryParse(_configuration["Email:SmtpPort"], out var port) ? port : 587,
            EnableSsl = bool.TryParse(_configuration["Email:EnableSsl"], out var enableSsl) && enableSsl,
        };

        var username = _configuration["Email:SmtpUsername"];
        var password = _configuration["Email:SmtpPassword"];
        if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        using var registration = cancellationToken.Register(client.SendAsyncCancel);
        await client.SendMailAsync(message, cancellationToken);
    }
}
