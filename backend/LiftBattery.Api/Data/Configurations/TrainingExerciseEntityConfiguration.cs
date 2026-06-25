using LiftBattery.Api.Data.Entities.Training;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class TrainingExerciseEntityConfiguration
    : IEntityTypeConfiguration<TrainingExercise>
{
    public void Configure(EntityTypeBuilder<TrainingExercise> builder)
    {
        builder.ToTable("TrainingExercises");

        builder.HasKey(entity => entity.Id);

        builder.Property(entity => entity.Id)
            .ValueGeneratedOnAdd();

        builder.Property(entity => entity.TrainingSessionId)
            .IsRequired();

        builder.Property(entity => entity.ExerciseOrder)
            .IsRequired();

        builder.Property(entity => entity.MuscleGroup)
            .IsRequired();

        builder.Property(entity => entity.ExerciseName)
            .IsRequired();

        builder.Property(entity => entity.CreatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.Property(entity => entity.UpdatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.HasOne(entity => entity.TrainingSession)
            .WithMany(entity => entity.Exercises)
            .HasForeignKey(entity => entity.TrainingSessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(entity => new
            {
                entity.TrainingSessionId,
                entity.ExerciseOrder
            })
            .IsUnique()
            .HasDatabaseName(
                "UX_TrainingExercises_TrainingSessionId_ExerciseId");
    }
}
