using LiftBattery.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class WeeklyReportDeliveryEntityConfiguration
    : IEntityTypeConfiguration<WeeklyReportDelivery>
{
    public void Configure(EntityTypeBuilder<WeeklyReportDelivery> builder)
    {
        builder.ToTable("WeeklyReportDelivery");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Id).ValueGeneratedOnAdd();
        builder.Property(entity => entity.ScheduleId).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.PeriodKey).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.RecipientEmail).HasMaxLength(256);
        builder.Property(entity => entity.SourceDataVersion).HasMaxLength(64);
        builder.Property(entity => entity.BlobPath).HasMaxLength(512);
        builder.Property(entity => entity.ProcessingClaimId).HasMaxLength(64);
        builder.Property(entity => entity.LastError).HasMaxLength(2000);
        builder.Property(entity => entity.DataSampledAtUtc).HasPrecision(7);
        builder.Property(entity => entity.GeneratedAtUtc).HasPrecision(7);
        builder.Property(entity => entity.SentAtUtc).HasPrecision(7);
        builder.Property(entity => entity.ProcessingLeaseUntilUtc).HasPrecision(7);
        builder.Property(entity => entity.CreatedAtUtc).HasPrecision(7);
        builder.Property(entity => entity.UpdatedAtUtc).HasPrecision(7);

        builder.HasIndex(entity => new { entity.ScheduleId, entity.PeriodKey })
            .IsUnique()
            .HasDatabaseName("UX_WeeklyReportDelivery_ScheduleId_PeriodKey");

        builder.HasOne(entity => entity.Schedule)
            .WithMany()
            .HasForeignKey(entity => entity.ScheduleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
