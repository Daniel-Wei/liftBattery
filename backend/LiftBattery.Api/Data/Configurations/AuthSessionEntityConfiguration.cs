using LiftBattery.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LiftBattery.Api.Data.Configurations;

public sealed class AuthSessionEntityConfiguration : IEntityTypeConfiguration<AuthSession>
{
    public void Configure(EntityTypeBuilder<AuthSession> builder)
    {
        builder.ToTable("AuthSessions");

        builder.HasKey(entity => entity.Id);

        builder.Property(entity => entity.Id)
            .ValueGeneratedOnAdd();

        builder.Property(entity => entity.TokenHash)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(entity => entity.CreatedAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.Property(entity => entity.ExpiresAtUtc)
            .HasPrecision(7)
            .IsRequired();

        builder.Property(entity => entity.RevokedAtUtc)
            .HasPrecision(7);

        builder.HasIndex(entity => entity.TokenHash)
            .IsUnique()
            .HasDatabaseName("UX_AuthSessions_TokenHash");

        builder.HasIndex(entity => new
            {
                entity.UserId,
                entity.ExpiresAtUtc,
            })
            .HasDatabaseName("IX_AuthSessions_UserId_ExpiresAtUtc");

        builder.HasOne(entity => entity.User)
            .WithMany(entity => entity.AuthSessions)
            .HasForeignKey(entity => entity.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
