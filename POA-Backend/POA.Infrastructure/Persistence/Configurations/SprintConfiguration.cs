using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class SprintConfiguration : IEntityTypeConfiguration<Sprint>
{
    public void Configure(EntityTypeBuilder<Sprint> builder)
    {
        builder.ToTable("sprints", "public");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id");

        builder.Property(s => s.ProjectId)
            .HasColumnName("project_id");

        builder.Property(s => s.Name)
            .HasColumnName("name")
            .IsRequired();

        builder.Property(s => s.StartDate)
            .HasColumnName("start_date")
            .HasColumnType("date");

        builder.Property(s => s.EndDate)
            .HasColumnName("end_date")
            .HasColumnType("date");

        builder.Property(s => s.Status)
            .HasColumnName("status")
            .HasDefaultValue("planned");

        builder.HasOne(s => s.Project)
            .WithMany(p => p.Sprints)
            .HasForeignKey(s => s.ProjectId);
    }
}

