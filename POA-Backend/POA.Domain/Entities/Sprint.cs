using System;
using System.Collections.Generic;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Sprint : BaseEntity
{
    public Guid? ProjectId { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public SprintStatus Status { get; set; } = SprintStatus.planned;

    public Project? Project { get; set; }

    public ICollection<Task> Tasks { get; set; } = new List<Task>();

    public ICollection<SprintStory> SprintStories { get; set; } = new List<SprintStory>();
}

