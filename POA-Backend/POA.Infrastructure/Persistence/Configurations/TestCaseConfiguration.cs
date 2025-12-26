using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class TestCaseConfiguration : IEntityTypeConfiguration<TestCase>
{
    public void Configure(EntityTypeBuilder<TestCase> builder)
    {
        builder.ToTable("test_cases", "public");

        builder.HasKey(tc => tc.Id);

        builder.Property(tc => tc.Id)
            .HasColumnName("id");

        builder.Property(tc => tc.StoryId)
            .HasColumnName("story_id");

        builder.Property(tc => tc.TestCaseText)
            .HasColumnName("test_case")
            .IsRequired();

        builder.Property(tc => tc.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        // Test cases table doesn't have updated_at column, so ignore it
        builder.Ignore(tc => tc.UpdatedAt);

        builder.HasOne(tc => tc.Story)
            .WithMany(s => s.TestCases)
            .HasForeignKey(tc => tc.StoryId);
    }
}

