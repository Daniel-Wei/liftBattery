namespace LiftBattery.Api.Models;

public static class WeeklyReportConstants
{
    public const string ReportType = "WeeklyTrendsReport";
    public const string MessageType = "WeeklyTrendsReportRequested";
    public const string DefaultTimeZoneId = "UTC";
}

public static class WeeklyReportDeliveryStatuses
{
    public const string Pending = "Pending";
    public const string BlobReady = "BlobReady";
    public const string Sent = "Sent";
}

public sealed record WeeklyReportPeriod(DateOnly Start, DateOnly End)
{
    public string Key => $"{Start:yyyy-MM-dd}_{End:yyyy-MM-dd}";

    public static bool TryParse(string periodKey, out WeeklyReportPeriod? period)
    {
        period = null;
        var parts = periodKey.Split('_', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 2
            || !DateOnly.TryParseExact(parts[0], "yyyy-MM-dd", out var start)
            || !DateOnly.TryParseExact(parts[1], "yyyy-MM-dd", out var end)
            || end < start)
        {
            return false;
        }

        period = new WeeklyReportPeriod(start, end);
        return true;
    }
}

public sealed record WeeklyReportPdfMetadata(
    WeeklyReportPeriod ReportingPeriod,
    string? SourceDataVersion,
    DateTimeOffset DataSampledAtUtc,
    DateTimeOffset GeneratedAtUtc);
