using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class TaskHistory : BaseEntity
{
    public Guid? TaskId { get; set; }

    public Guid? UserId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string? OldValue { get; set; }

    public string? NewValue { get; set; }

    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    public Task? Task { get; set; }

    public User? User { get; set; }
}

