using System.Text.Json;
using Azure.Core.Serialization;
using LiftOps.Api.Repositories;
using LiftOps.Api.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.Configure<WorkerOptions>(options =>
        {
            options.Serializer = new JsonObjectSerializer(new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true,
            });
        });

        services.AddSingleton<IPreCheckRepository, PreCheckRepository>();
        services.AddSingleton<ITrainingLogRepository, TrainingLogRepository>();
        services.AddSingleton<IPreCheckService, PreCheckService>();
        services.AddSingleton<ITrainingSessionService, TrainingSessionService>();
    })
    .Build();

host.Run();
