using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface IWeeklyReportPdfGenerator
{
    byte[] GeneratePdf(TrendReportResultDto report, int dataVersion, string correlationId);
}
