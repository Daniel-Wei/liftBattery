using LiftBattery.Api.DTOs;

namespace LiftBattery.Api.Services;

public interface IWeeklyReportBlobStorage
{
    Task<string> UploadAsync(
        int userId,
        string weekStartDate,
        string weekEndDate,
        int dataVersion,
        string correlationId,
        byte[] pdfBytes,
        CancellationToken cancellationToken = default);
}
