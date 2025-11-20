using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Estimate : BaseAuditableEntity
{
    public Guid? TaskId { get; set; }

    public Guid? UserId { get; set; }

    public int? Points { get; set; }

    public string? Note { get; set; }

    public Task? Task { get; set; }

    public User? User { get; set; }
}

