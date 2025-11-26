using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class WorklogConfiguration : IEntityTypeConfiguration<Worklog>
{
    public void Configure(EntityTypeBuilder<Worklog> builder)
    {
        builder.ToTable("worklogs", "public");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.Id)
            .HasColumnName("id");

        builder.Property(w => w.TaskId)
            .HasColumnName("task_id");

        builder.Property(w => w.UserId)
            .HasColumnName("user_id");

        builder.Property(w => w.Date)
            .HasColumnName("date")
            .HasColumnType("date");

        builder.Property(w => w.Hours)
            .HasColumnName("hours")
            .HasColumnType("numeric(8,2)")
            .IsRequired();

        builder.Property(w => w.Description)
            .HasColumnName("description");

        builder.Property(w => w.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        // Worklogs table doesn't have updated_at column, so ignore it
        builder.Ignore(w => w.UpdatedAt);

        builder.HasOne(w => w.Task)
            .WithMany(t => t.Worklogs)
            .HasForeignKey(w => w.TaskId);

        builder.HasOne(w => w.User)
            .WithMany(u => u.Worklogs)
            .HasForeignKey(w => w.UserId)
            .HasPrincipalKey(u => u.SupabaseUserId);
    }
}

