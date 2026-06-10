using LiftOps.Api.Repositories;
using LiftOps.Api.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.AddSingleton<IPreCheckRepository, PreCheckRepository>();
        services.AddSingleton<ITrainingLogRepository, TrainingLogRepository>();
        services.AddSingleton<IPreCheckService, PreCheckService>();
        services.AddSingleton<ITrainingLogService, TrainingLogService>();
    })
    .Build();

host.Run();
