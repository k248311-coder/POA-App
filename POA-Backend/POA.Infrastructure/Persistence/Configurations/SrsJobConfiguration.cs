using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class SrsJobConfiguration : IEntityTypeConfiguration<SrsJob>
{
    public void Configure(EntityTypeBuilder<SrsJob> builder)
    {
        builder.ToTable("srs_jobs", "public");

        builder.HasKey(job => job.Id);

        builder.Property(job => job.Id)
            .HasColumnName("id");

        builder.Property(job => job.ProjectId)
            .HasColumnName("project_id");

        builder.Property(job => job.SrsPath)
            .HasColumnName("srs_path");

        builder.Property(job => job.Status)
            .HasColumnName("status")
            .HasDefaultValue("queued");

        builder.Property(job => job.StartedAt)
            .HasColumnName("started_at")
            .HasColumnType("timestamptz");

        builder.Property(job => job.CompletedAt)
            .HasColumnName("completed_at")
            .HasColumnType("timestamptz");

        builder.Property(job => job.ResultSummary)
            .HasColumnName("result_summary");

        builder.Property(job => job.Error)
            .HasColumnName("error");

        builder.Property(job => job.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        // SrsJobs table doesn't have updated_at column, so ignore it
        builder.Ignore(job => job.UpdatedAt);

        builder.HasOne(job => job.Project)
            .WithMany(project => project.SrsJobs)
            .HasForeignKey(job => job.ProjectId);
    }
}

