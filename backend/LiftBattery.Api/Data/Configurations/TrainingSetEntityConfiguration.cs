using LiftBattery.Api.Data.Entities.Training;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class TrainingSetEntityConfiguration
    : IEntityTypeConfiguration<TrainingSet>
{
    public void Configure(EntityTypeBuilder<TrainingSet> builder)
    {
        builder.ToTable(
            "TrainingSets",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_TrainingSets_SetOrder",
                    "[SetOrder] > 0");

                table.HasCheckConstraint(
                    "CK_TrainingSets_Reps",
                    "[Reps] >= 0");

                table.HasCheckConstraint(
                    "CK_TrainingSets_WeightKg",
                    "[WeightKg] >= 0");

                table.HasCheckConstraint(
                    "CK_TrainingSets_Rpe",
                    "[Rpe] IS NULL OR ([Rpe] >= 0 AND [Rpe] <= 10)");

                table.HasCheckConstraint(
                    "CK_TrainingSets_Rir",
                    "[Rir] IS NULL OR ([Rir] >= 0 AND [Rir] <= 10)");
            });

        builder.HasKey(entity => entity.Id);

        builder.Property(entity => entity.Id)
            .ValueGeneratedOnAdd();

        builder.Property(entity => entity.TrainingExerciseId)
            .IsRequired();

        builder.Property(entity => entity.SetOrder)
            .IsRequired();

        builder.Property(entity => entity.Reps)
            .IsRequired();

        builder.Property(entity => entity.WeightKg)
            .HasPrecision(7, 2)
            .IsRequired();

        builder.Property(entity => entity.IsWarmUp)
            .IsRequired();

        builder.Property(entity => entity.Rpe)
            .HasPrecision(3, 1);

        builder.Property(entity => entity.Rir)
            .HasPrecision(3, 1);

        builder.Property(entity => entity.CreatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.Property(entity => entity.UpdatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.HasOne(entity => entity.TrainingExercise)
            .WithMany(entity => entity.Sets)
            .HasForeignKey(entity => entity.TrainingExerciseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(entity => new
            {
                entity.TrainingExerciseId,
                entity.SetOrder
            })
            .IsUnique()
            .HasDatabaseName(
                "UX_TrainingSets_TrainingExerciseId_SetOrder");
    }
}
