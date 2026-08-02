using LiftBattery.Api.Repositories;
using Xunit;

namespace LiftBattery.Api.Tests;

public sealed class TrendReportJobRepositoryTests
{
    [Fact]
    public void CreateUnstartedEnqueueRecoveryFilterDoesNotCompareNullablePropertyToNull()
    {
        var filter = TrendReportJobRepository.CreateUnstartedEnqueueRecoveryFilter(
            new DateTimeOffset(2026, 8, 2, 12, 0, 0, TimeSpan.Zero));

        Assert.Contains("Status eq 'EnqueuePending'", filter, StringComparison.Ordinal);
        Assert.Contains("CreatedAtUtc le", filter, StringComparison.Ordinal);
        Assert.DoesNotContain("StartedAtUtc", filter, StringComparison.Ordinal);
        Assert.DoesNotContain("null", filter, StringComparison.OrdinalIgnoreCase);
    }
}
