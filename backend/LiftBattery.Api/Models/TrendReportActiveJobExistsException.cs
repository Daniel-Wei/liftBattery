namespace LiftBattery.Api.Models;

/// <summary>
/// Represents the expected product conflict where another report request owns the
/// user's single active-job lease. The API maps this condition to HTTP 409.
/// </summary>
public sealed class TrendReportActiveJobExistsException : InvalidOperationException
{
    public TrendReportActiveJobExistsException(Guid activeJobId)
        : base("A trend report job is still active. Cancel it before generating another report.")
    {
        ActiveJobId = activeJobId;
    }

    public Guid ActiveJobId { get; }
}
