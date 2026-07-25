namespace LiftBattery.Api.Services;

public sealed class TrendReportNoDataException : Exception
{
    public TrendReportNoDataException(string message)
        : base(message)
    {
    }
}
