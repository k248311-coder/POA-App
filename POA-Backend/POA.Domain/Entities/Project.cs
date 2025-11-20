using System;
using System.Collections.Generic;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Project : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Guid? OwnerTeamId { get; set; }

    public Guid? OwnerUserId { get; set; }

    public string? SrsPath { get; set; }

    public string? Summary { get; set; }

    public Team? OwnerTeam { get; set; }

    public User? OwnerUser { get; set; }

    public ICollection<Epic> Epics { get; set; } = new List<Epic>();

    public ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();

    public ICollection<LlmPrompt> LlmPrompts { get; set; } = new List<LlmPrompt>();

    public ICollection<SrsJob> SrsJobs { get; set; } = new List<SrsJob>();
}

