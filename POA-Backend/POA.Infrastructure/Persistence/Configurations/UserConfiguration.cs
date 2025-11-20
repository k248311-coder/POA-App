using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users", "public");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .HasColumnName("id");

        builder.Property(u => u.SupabaseUserId)
            .HasColumnName("supabase_user_id");

        builder.Property(u => u.Email)
            .HasColumnName("email");

        builder.Property(u => u.DisplayName)
            .HasColumnName("display_name");

        builder.Property(u => u.Role)
            .HasColumnName("role")
            .HasDefaultValue("team_member");

        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("timestamptz");
    }
}

