using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users", "public");

        // Use SupabaseUserId as primary key (references auth.users.id)
        builder.HasKey(u => u.SupabaseUserId);

        builder.Property(u => u.SupabaseUserId)
            .HasColumnName("supabase_user_id")
            .IsRequired();

        // Ignore the Id property from BaseEntity since we use SupabaseUserId as PK
        builder.Ignore(u => u.Id);

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

        // Users table doesn't have updated_at column, so ignore it
        builder.Ignore(u => u.UpdatedAt);
    }
}

