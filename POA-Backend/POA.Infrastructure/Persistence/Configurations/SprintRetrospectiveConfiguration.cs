using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence.Configurations;

public sealed class SprintRetrospectiveConfiguration : IEntityTypeConfiguration<SprintRetrospective>
{
    public void Configure(EntityTypeBuilder<SprintRetrospective> builder)
    {
        builder.ToTable("sprint_retrospectives", "public");

        builder.HasKey(sr => sr.Id);

        builder.Property(sr => sr.Id)
            .HasColumnName("id");

        builder.Property(sr => sr.SprintId)
            .HasColumnName("sprint_id")
            .IsRequired();

        builder.Property(sr => sr.WhatWentWell)
            .HasColumnName("what_went_well");

        builder.Property(sr => sr.WhatDidntGoWell)
            .HasColumnName("what_didnt_go_well");

        builder.Property(sr => sr.IdeasGoingForward)
            .HasColumnName("ideas_going_forward");

        builder.Property(sr => sr.ActionItems)
            .HasColumnName("action_items");

        builder.Property(sr => sr.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasOne(sr => sr.Sprint)
            .WithMany()
            .HasForeignKey(sr => sr.SprintId);
    }
}
