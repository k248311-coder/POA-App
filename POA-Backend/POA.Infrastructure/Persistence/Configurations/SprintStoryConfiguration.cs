using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class SprintStoryConfiguration : IEntityTypeConfiguration<SprintStory>
{
    public void Configure(EntityTypeBuilder<SprintStory> builder)
    {
        builder.ToTable("sprint_stories", "public");

        builder.HasKey(ss => ss.Id);

        builder.Property(ss => ss.Id)
            .HasColumnName("id");

        builder.Property(ss => ss.SprintId)
            .HasColumnName("sprint_id");

        builder.Property(ss => ss.StoryId)
            .HasColumnName("story_id");

        builder.Property(ss => ss.Priority)
            .HasColumnName("priority")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(ss => ss.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()");

        builder.HasOne(ss => ss.Sprint)
            .WithMany(s => s.SprintStories)
            .HasForeignKey(ss => ss.SprintId);

        builder.HasOne(ss => ss.Story)
            .WithMany(s => s.SprintStories)
            .HasForeignKey(ss => ss.StoryId);
            
        builder.HasIndex(ss => new { ss.SprintId, ss.StoryId })
            .IsUnique();
    }
}
