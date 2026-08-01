using LiftBattery.Api.DTOs;
using LiftBattery.Api.Models;

namespace LiftBattery.Api.Services;

public interface IWeeklyReportPdfGenerator
{
    byte[] GeneratePdf(TrendReportResultDto report, WeeklyReportPdfMetadata metadata);
}
