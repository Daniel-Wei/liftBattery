using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.Text.Json;

namespace LiftBattery.Api.Data;

public sealed class LiftBatteryDbContextFactory : IDesignTimeDbContextFactory<LiftBatteryDbContext>
{
    private const string ConnectionStringKey = "ConnectionStrings__LiftBatteryDatabase";

    public LiftBatteryDbContext CreateDbContext(string[] args)
    {
        var connectionString = GetConnectionStringFromLocalSettings()
            ?? Environment.GetEnvironmentVariable(ConnectionStringKey);

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                $"Set {ConnectionStringKey} or add it to local.settings.json before running EF Core commands.");
        }

        var options = new DbContextOptionsBuilder<LiftBatteryDbContext>()
            .UseSqlServer(connectionString)
            .Options;
        return new LiftBatteryDbContext(options);
    }

    private static string? GetConnectionStringFromLocalSettings()
    {
        var localSettingsPath = FindLocalSettingsPath();
        if (localSettingsPath is null)
        {
            return null;
        }

        using var document = JsonDocument.Parse(File.ReadAllText(localSettingsPath));
        if (!document.RootElement.TryGetProperty("Values", out var values) ||
            !values.TryGetProperty(ConnectionStringKey, out var connectionString))
        {
            return null;
        }

        return connectionString.GetString();
    }

    private static string? FindLocalSettingsPath()
    {
        var currentDirectory = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (currentDirectory is not null)
        {
            var localSettingsPath = Path.Combine(currentDirectory.FullName, "local.settings.json");
            if (File.Exists(localSettingsPath))
            {
                return localSettingsPath;
            }

            var apiLocalSettingsPath = Path.Combine(
                currentDirectory.FullName,
                "backend",
                "LiftBattery.Api",
                "local.settings.json");
            if (File.Exists(apiLocalSettingsPath))
            {
                return apiLocalSettingsPath;
            }

            currentDirectory = currentDirectory.Parent;
        }

        return null;
    }
}
