using System;
using System.Collections.Generic;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Task : BaseAuditableEntity
{
    public Guid? StoryId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Type { get; set; } = "feature";

    public decimal? DevHours { get; set; }

    public decimal? TestHours { get; set; }

    public Guid? AssigneeId { get; set; }

    public string? AssigneeRole { get; set; }

    public decimal? CostDev { get; set; }

    public decimal? CostTest { get; set; }

    public decimal? TotalCost { get; set; }

    public string Status { get; set; } = "todo";

    public Guid? SprintId { get; set; }

    public bool IsInProductBacklog { get; set; } = true;

    public bool IsInSprintBacklog { get; set; }

    public Story? Story { get; set; }

    public Sprint? Sprint { get; set; }

    public User? Assignee { get; set; }

    public ICollection<Estimate> Estimates { get; set; } = new List<Estimate>();

    public ICollection<TaskHistory> History { get; set; } = new List<TaskHistory>();

    public ICollection<Worklog> Worklogs { get; set; } = new List<Worklog>();
}

