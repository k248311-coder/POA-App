using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("projects", "public");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasColumnName("id");

        builder.Property(p => p.Name)
            .HasColumnName("name")
            .IsRequired();

        builder.Property(p => p.Description)
            .HasColumnName("description");

        builder.Property(p => p.OwnerTeamId)
            .HasColumnName("owner_team_id");

        builder.Property(p => p.OwnerUserId)
            .HasColumnName("owner_user_id");

        builder.Property(p => p.SrsPath)
            .HasColumnName("srs_path");

        builder.Property(p => p.Summary)
            .HasColumnName("summary");

        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");

        // Projects table doesn't have updated_at column, so ignore it
        builder.Ignore(p => p.UpdatedAt);

        builder.HasOne(p => p.OwnerTeam)
            .WithMany(t => t.Projects)
            .HasForeignKey(p => p.OwnerTeamId);

        builder.HasOne(p => p.OwnerUser)
            .WithMany(u => u.OwnedProjects)
            .HasForeignKey(p => p.OwnerUserId)
            .HasPrincipalKey(u => u.SupabaseUserId);
    }
}

