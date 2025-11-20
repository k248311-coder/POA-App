using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class LlmPromptConfiguration : IEntityTypeConfiguration<LlmPrompt>
{
    public void Configure(EntityTypeBuilder<LlmPrompt> builder)
    {
        builder.ToTable("llm_prompts", "public");

        builder.HasKey(lp => lp.Id);

        builder.Property(lp => lp.Id)
            .HasColumnName("id");

        builder.Property(lp => lp.ProjectId)
            .HasColumnName("project_id");

        builder.Property(lp => lp.UserId)
            .HasColumnName("user_id");

        builder.Property(lp => lp.Prompt)
            .HasColumnName("prompt");

        builder.Property(lp => lp.Response)
            .HasColumnName("response")
            .HasColumnType("jsonb");

        builder.Property(lp => lp.Model)
            .HasColumnName("model");

        builder.Property(lp => lp.Tokens)
            .HasColumnName("tokens");

        builder.Property(lp => lp.Status)
            .HasColumnName("status")
            .HasDefaultValue("queued");

        builder.Property(lp => lp.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("jsonb");

        builder.Property(lp => lp.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        builder.HasOne(lp => lp.Project)
            .WithMany(p => p.LlmPrompts)
            .HasForeignKey(lp => lp.ProjectId);

        builder.HasOne(lp => lp.User)
            .WithMany(u => u.Prompts)
            .HasForeignKey(lp => lp.UserId);
    }
}

