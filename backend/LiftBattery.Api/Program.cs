using System.Text.Json;
using Azure.Core.Serialization;
using LiftBattery.Api.Data;
using LiftBattery.Api.Options;
using LiftBattery.Api.Repositories;
using LiftBattery.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        services.Configure<WorkerOptions>(options =>
        {
            options.Serializer = new JsonObjectSerializer(new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true,
            });
        });

        var databaseConnection = context.Configuration.GetConnectionString("LiftBatteryDatabase")
            ?? throw new InvalidOperationException(
                "ConnectionStrings:LiftBatteryDatabase is required for PreCheck persistence.");

        services.Configure<PreCheckOptions>(
            context.Configuration.GetSection(PreCheckOptions.SectionName));
        services.Configure<TrainingOptions>(
            context.Configuration.GetSection(TrainingOptions.SectionName));
        services.Configure<AuthOptions>(
            context.Configuration.GetSection(AuthOptions.SectionName));
        services.AddDbContext<LiftBatteryDbContext>(options =>
            options.UseSqlServer(databaseConnection, sqlOptions => sqlOptions.EnableRetryOnFailure()));
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<PasswordHashingService>();
        services.AddScoped<AuthCookieHelper>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPreCheckRepository, PreCheckRepository>();
        services.AddScoped<ITrainingRepository, TrainingRepository>();
        services.AddScoped<IPreCheckService, PreCheckService>();
        services.AddScoped<ITrainingSessionService, TrainingSessionService>();
        services.AddScoped<ITrendReportJobRepository, TrendReportJobRepository>();
        services.AddScoped<ITrendReportQueue, TrendReportServiceBusQueue>();
        services.AddScoped<ITrendReportService, TrendReportService>();
    })
    .Build();

host.Run();
