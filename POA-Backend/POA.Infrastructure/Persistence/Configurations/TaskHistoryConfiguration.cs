using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class TaskHistoryConfiguration : IEntityTypeConfiguration<TaskHistory>
{
    public void Configure(EntityTypeBuilder<TaskHistory> builder)
    {
        builder.ToTable("task_history", "public");

        builder.HasKey(th => th.Id);

        builder.Property(th => th.Id)
            .HasColumnName("id");

        builder.Property(th => th.TaskId)
            .HasColumnName("task_id");

        builder.Property(th => th.UserId)
            .HasColumnName("user_id");

        builder.Property(th => th.Action)
            .HasColumnName("action")
            .IsRequired();

        builder.Property(th => th.OldValue)
            .HasColumnName("old_value");

        builder.Property(th => th.NewValue)
            .HasColumnName("new_value");

        builder.Property(th => th.Timestamp)
            .HasColumnName("timestamp")
            .HasColumnType("timestamptz");

        builder.HasOne(th => th.Task)
            .WithMany(t => t.History)
            .HasForeignKey(th => th.TaskId);

        builder.HasOne(th => th.User)
            .WithMany(u => u.TaskHistories)
            .HasForeignKey(th => th.UserId);
    }
}

