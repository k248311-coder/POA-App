using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Worklog : BaseAuditableEntity
{
    public Guid? TaskId { get; set; }

    public Guid? UserId { get; set; }

    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public decimal Hours { get; set; }

    public string? Description { get; set; }

    public Task? Task { get; set; }

    public User? User { get; set; }
}

