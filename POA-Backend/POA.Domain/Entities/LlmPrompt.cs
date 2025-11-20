using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class LlmPrompt : BaseAuditableEntity
{
    public Guid? ProjectId { get; set; }

    public Guid? UserId { get; set; }

    public string? Prompt { get; set; }

    public string? Response { get; set; }

    public string? Model { get; set; }

    public int? Tokens { get; set; }

    public string Status { get; set; } = "queued";

    public string? Metadata { get; set; }

    public Project? Project { get; set; }

    public User? User { get; set; }
}

