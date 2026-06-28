using LiftBattery.Api.Data.Entities.Training;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class TrainingDayEntityConfiguration
    : IEntityTypeConfiguration<TrainingDay>
{
    public void Configure(EntityTypeBuilder<TrainingDay> builder)
    {
        builder.ToTable("TrainingDays");

        builder.HasKey(entity => entity.Id);

        builder.Property(entity => entity.Id)
            .ValueGeneratedOnAdd();

        builder.Property(entity => entity.UserId)
            .IsRequired();

        builder.Property(entity => entity.Date)
            .IsRequired();

        builder.Property(entity => entity.CreatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.Property(entity => entity.UpdatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.HasIndex(entity => new
            {
                entity.UserId,
                entity.Date
            })
            .IsUnique()
            .HasDatabaseName("UX_TrainingDays_UserId_Date");

        builder.HasOne<LiftBattery.Api.Data.Entities.User>()
            .WithMany()
            .HasForeignKey(entity => entity.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
