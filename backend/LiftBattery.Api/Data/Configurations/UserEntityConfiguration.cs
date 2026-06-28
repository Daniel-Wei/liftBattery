using LiftBattery.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class UserEntityConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users", table =>
        {
            table.HasCheckConstraint(
                "CK_Users_WeeklyTargetTrainingDays",
                "[WeeklyTargetTrainingDays] >= 1 AND [WeeklyTargetTrainingDays] <= 14");
            table.HasCheckConstraint(
                "CK_Users_PreferredUnit",
                "[PreferredUnit] IN ('kg', 'lb')");
        });

        builder.HasKey(entity => entity.Id);

        builder.Property(entity => entity.Id)
            .ValueGeneratedOnAdd();

        builder.Property(entity => entity.DisplayName)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(entity => entity.Email)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(entity => entity.NormalizedEmail)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(entity => entity.PasswordHash)
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(entity => entity.TrainingGoal)
            .HasMaxLength(240);

        builder.Property(entity => entity.WeeklyTargetTrainingDays)
            .IsRequired();

        builder.Property(entity => entity.PreferredUnit)
            .HasMaxLength(8)
            .IsRequired();

        builder.Property(entity => entity.CreatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.Property(entity => entity.UpdatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.HasIndex(entity => entity.NormalizedEmail)
            .IsUnique()
            .HasDatabaseName("UX_Users_NormalizedEmail");

    }
}
