using LiftBattery.Api.Data.Entities;
using LiftBattery.Api.Data.Entities.Training;
using Microsoft.EntityFrameworkCore;

namespace LiftBattery.Api.Data;

public sealed class LiftBatteryDbContext(DbContextOptions<LiftBatteryDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<AuthSession> AuthSessions => Set<AuthSession>();
    public DbSet<PreCheck> PreChecks => Set<PreCheck>();
    public DbSet<TrainingSet> TrainingSets => Set<TrainingSet>();
    public DbSet<TrainingExercise> TrainingExercises => Set<TrainingExercise>();
    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();
    public DbSet<TrainingDay> TrainingDays => Set<TrainingDay>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LiftBatteryDbContext).Assembly);
    }
}
