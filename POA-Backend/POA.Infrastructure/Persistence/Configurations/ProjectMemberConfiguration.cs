using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class ProjectMemberConfiguration : IEntityTypeConfiguration<ProjectMember>
{
    public void Configure(EntityTypeBuilder<ProjectMember> builder)
    {
        builder.ToTable("project_members", "public");

        builder.HasKey(pm => pm.Id);

        builder.Property(pm => pm.Id)
            .HasColumnName("id");

        builder.Property(pm => pm.ProjectId)
            .HasColumnName("project_id")
            .IsRequired();

        builder.Property(pm => pm.UserId)
            .HasColumnName("user_id");

        builder.Property(pm => pm.Email)
            .HasColumnName("email")
            .IsRequired();

        builder.Property(pm => pm.Role)
            .HasColumnName("role")
            .IsRequired();

        builder.Property(pm => pm.HourlyCost)
            .HasColumnName("hourly_cost")
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(pm => pm.Status)
            .HasColumnName("status")
            .IsRequired()
            .HasDefaultValue("Pending");

        builder.Property(pm => pm.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz")
            .IsRequired();

        builder.Property(pm => pm.UpdatedAt)
            .HasColumnName("updated_at")
            .HasColumnType("timestamptz");

        // Relationships
        builder.HasOne(pm => pm.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pm => pm.User)
            .WithMany()
            .HasForeignKey(pm => pm.UserId)
            .HasPrincipalKey(u => u.SupabaseUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
