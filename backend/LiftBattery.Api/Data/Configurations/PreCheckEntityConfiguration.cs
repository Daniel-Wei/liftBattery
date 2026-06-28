using LiftBattery.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class PreCheckEntityConfiguration : IEntityTypeConfiguration<PreCheck>
{
    public void Configure(EntityTypeBuilder<PreCheck> builder)
    {
        builder.ToTable("PreChecks");
        
        builder.HasKey(entity => entity.Id);
        
        builder.Property(entity => entity.Id)
            .ValueGeneratedOnAdd();

        builder.Property(entity => entity.UserId)
            .IsRequired();
        
        builder.Property(entity => entity.SleepHours)
            .HasPrecision(4, 2);
        
        builder.Property(entity => entity.CreatedAtUtc)
            .HasPrecision(7);
        
        builder.Property(entity => entity.UpdatedAtUtc)
            .HasPrecision(7);
        
        builder.HasIndex(entity => 
            new { 
                entity.UserId, 
                entity.PreCheckDate 
            })
            .IsUnique()
            .HasDatabaseName(
                "UX_PreChecks_UserId_PreCheckDate");

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(entity => entity.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
