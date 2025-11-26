using System;
using System.Collections.Generic;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class User : BaseAuditableEntity
{
    public Guid SupabaseUserId { get; set; }

    public string? Email { get; set; }

    public string? DisplayName { get; set; }

    public string Role { get; set; } = "team_member";

    public ICollection<Project> OwnedProjects { get; set; } = new List<Project>();

    public ICollection<Team> OwnedTeams { get; set; } = new List<Team>();

    public ICollection<Task> AssignedTasks { get; set; } = new List<Task>();

    public ICollection<Estimate> Estimates { get; set; } = new List<Estimate>();

    public ICollection<TaskHistory> TaskHistories { get; set; } = new List<TaskHistory>();

    public ICollection<Worklog> Worklogs { get; set; } = new List<Worklog>();

    public ICollection<LlmPrompt> Prompts { get; set; } = new List<LlmPrompt>();
}

