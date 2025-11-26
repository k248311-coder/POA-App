using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskEntity = POA.Domain.Entities.Task;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class TaskConfiguration : IEntityTypeConfiguration<TaskEntity>
{
    public void Configure(EntityTypeBuilder<TaskEntity> builder)
    {
        builder.ToTable("tasks", "public");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasColumnName("id");

        builder.Property(t => t.StoryId)
            .HasColumnName("story_id");

        builder.Property(t => t.Title)
            .HasColumnName("title")
            .IsRequired();

        builder.Property(t => t.Description)
            .HasColumnName("description");

        builder.Property(t => t.Type)
            .HasColumnName("type")
            .HasDefaultValue("feature");

        builder.Property(t => t.DevHours)
            .HasColumnName("dev_hours")
            .HasColumnType("numeric(8,2)");

        builder.Property(t => t.TestHours)
            .HasColumnName("test_hours")
            .HasColumnType("numeric(8,2)");

        builder.Property(t => t.AssigneeId)
            .HasColumnName("assignee_id");

        builder.Property(t => t.AssigneeRole)
            .HasColumnName("assignee_role");

        builder.Property(t => t.CostDev)
            .HasColumnName("cost_dev")
            .HasColumnType("numeric(12,2)")
            .HasDefaultValue(0m);

        builder.Property(t => t.CostTest)
            .HasColumnName("cost_test")
            .HasColumnType("numeric(12,2)")
            .HasDefaultValue(0m);

        builder.Property(t => t.TotalCost)
            .HasColumnName("total_cost")
            .HasColumnType("numeric(14,2)");

        builder.Property(t => t.Status)
            .HasColumnName("status")
            .HasDefaultValue("todo");

        builder.Property(t => t.SprintId)
            .HasColumnName("sprint_id");

        builder.Property(t => t.IsInProductBacklog)
            .HasColumnName("is_in_product_backlog");

        builder.Property(t => t.IsInSprintBacklog)
            .HasColumnName("is_in_sprint_backlog");

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamptz");

        builder.HasOne(t => t.Story)
            .WithMany(s => s.Tasks)
            .HasForeignKey(t => t.StoryId);

        builder.HasOne(t => t.Assignee)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.AssigneeId)
            .HasPrincipalKey(u => u.SupabaseUserId);

        builder.HasOne(t => t.Sprint)
            .WithMany(s => s.Tasks)
            .HasForeignKey(t => t.SprintId);
    }
}

