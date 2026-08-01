using LiftBattery.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class WeeklyReportScheduleEntityConfiguration
    : IEntityTypeConfiguration<WeeklyReportSchedule>
{
    public void Configure(EntityTypeBuilder<WeeklyReportSchedule> builder)
    {
        builder.ToTable("WeeklyReportSchedule");
        builder.HasKey(entity => entity.ScheduleId);
        builder.Property(entity => entity.ScheduleId).HasMaxLength(96);
        builder.Property(entity => entity.RecipientEmail).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.TimeZoneId).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.LocalSendTime).HasColumnType("time(0)");
        builder.Property(entity => entity.LastPeriodKey).HasMaxLength(32);
        builder.Property(entity => entity.ClaimedBy).HasMaxLength(160);
        builder.Property(entity => entity.ClaimedPeriodKey).HasMaxLength(32);
        builder.Property(entity => entity.NextRunAtUtc).HasPrecision(7);
        builder.Property(entity => entity.LastRunAtUtc).HasPrecision(7);
        builder.Property(entity => entity.LeaseUntilUtc).HasPrecision(7);
        builder.Property(entity => entity.CreatedAtUtc).HasPrecision(7);
        builder.Property(entity => entity.UpdatedAtUtc).HasPrecision(7);

        builder.HasIndex(entity => entity.UserId)
            .IsUnique()
            .HasDatabaseName("UX_WeeklyReportSchedule_UserId");

        // This is the only index the five-minute dispatcher scan needs. SQL Server
        // can seek directly to enabled schedules whose NextRunAtUtc is due.
        builder.HasIndex(entity => entity.NextRunAtUtc)
            .HasDatabaseName("IX_WeeklyReportSchedule_Due")
            .HasFilter("[Enabled] = 1")
            .IncludeProperties(entity => new { entity.ScheduleId, entity.UserId });

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(entity => entity.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
