using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class SrsJob : BaseAuditableEntity
{
    public Guid? ProjectId { get; set; }

    public string? SrsPath { get; set; }

    public string Status { get; set; } = "queued";

    public DateTimeOffset? StartedAt { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public string? ResultSummary { get; set; }

    public string? Error { get; set; }

    public Project? Project { get; set; }
}

