using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class FeatureConfiguration : IEntityTypeConfiguration<Feature>
{
    public void Configure(EntityTypeBuilder<Feature> builder)
    {
        builder.ToTable("features", "public");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Id)
            .HasColumnName("id");

        builder.Property(f => f.EpicId)
            .HasColumnName("epic_id");

        builder.Property(f => f.Title)
            .HasColumnName("title")
            .IsRequired();

        builder.Property(f => f.Description)
            .HasColumnName("description");

        builder.Property(f => f.Priority)
            .HasColumnName("priority");

        builder.Property(f => f.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        builder.HasOne(f => f.Epic)
            .WithMany(e => e.Features)
            .HasForeignKey(f => f.EpicId);
    }
}

