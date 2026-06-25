using LiftBattery.Api.Data.Entities.Training;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class TrainingSessionEntityConfiguration
    : IEntityTypeConfiguration<TrainingSession>
{
    public void Configure(EntityTypeBuilder<TrainingSession> builder)
    {
        builder.ToTable(
            "TrainingSessions",
            table => {
                table.HasCheckConstraint(
                    "CK_TrainingSessions_SessionRpe",
                    "[SessionRpe] >= 0 AND [SessionRpe] <= 10");

                table.HasCheckConstraint(
                    "CK_TrainingSessions_DurationMinutes",
                    "[DurationMinutes] > 0");
            }
        );

        builder.HasKey(entity => entity.Id);

        builder.Property(entity => entity.Id)
            .ValueGeneratedOnAdd();

        builder.Property(entity => entity.TrainingDayId)
            .IsRequired();

        builder.Property(entity => entity.StartTime)
            .IsRequired();

        builder.Property(entity => entity.DurationMinutes)
            .IsRequired();

        builder.Property(entity => entity.SessionRpe)
            .HasPrecision(3, 1)
            .IsRequired();

        builder.Property(entity => entity.CreatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.Property(entity => entity.UpdatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.HasOne(entity => entity.TrainingDay)
            .WithMany(entity => entity.Sessions)
            .HasForeignKey(entity => entity.TrainingDayId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(entity => new
            {
                entity.TrainingDayId,
                entity.StartTime
            })
            .IsUnique()
            .HasDatabaseName(
                "UX_TrainingSessions_TrainingDayId_StartTime");
    }
}
