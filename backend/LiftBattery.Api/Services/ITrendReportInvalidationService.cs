namespace LiftBattery.Api.Services;

public interface ITrendReportInvalidationService
{
    Task InvalidateForReportDataChangeAsync(
        int userId,
        CancellationToken cancellationToken = default);
}
