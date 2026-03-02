using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class StoryConfiguration : IEntityTypeConfiguration<Story>
{
    public void Configure(EntityTypeBuilder<Story> builder)
    {
        builder.ToTable("stories", "public");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id");

        builder.Property(s => s.FeatureId)
            .HasColumnName("feature_id");

        builder.Property(s => s.Title)
            .HasColumnName("title")
            .IsRequired();

        builder.Property(s => s.Description)
            .HasColumnName("description");

        builder.Property(s => s.AcceptanceCriteria)
            .HasColumnName("acceptance_criteria")
            .HasConversion(
                v => string.Join("\n", v),
                v => v.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).ToList());

        builder.Property(s => s.StoryPoints)
            .HasColumnName("story_points");

        builder.Property(s => s.EstimatedDevHours)
            .HasColumnName("estimated_dev_hours")
            .HasColumnType("numeric(8,2)");

        builder.Property(s => s.EstimatedTestHours)
            .HasColumnName("estimated_test_hours")
            .HasColumnType("numeric(8,2)");

        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        builder.Property(s => s.Priority)
            .HasColumnName("priority")
            .HasDefaultValue(0);

        // Stories table doesn't have updated_at column, so ignore it
        builder.Ignore(s => s.UpdatedAt);

        builder.HasOne(s => s.Feature)
            .WithMany(f => f.Stories)
            .HasForeignKey(s => s.FeatureId);
    }
}

