namespace LiftBattery.Api.Services;

public interface ITrendReportInvalidationService
{
    Task InvalidateForReportDataChangeAsync(
        int userId,
        DateOnly changedDate,
        CancellationToken cancellationToken = default);
}
