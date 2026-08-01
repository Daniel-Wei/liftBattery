namespace LiftBattery.Api.Services;

public sealed record EmailAttachment(
    string FileName,
    string ContentType,
    byte[] Content);

public interface IEmailSender
{
    Task SendAsync(
        string recipientEmail,
        string subject,
        string body,
        string idempotencyKey,
        EmailAttachment attachment,
        CancellationToken cancellationToken = default);
}
