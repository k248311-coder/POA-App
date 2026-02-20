using System;
using System.Collections.Generic;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Story : BaseAuditableEntity
{
    public Guid? FeatureId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? AcceptanceCriteria { get; set; }

    public int? StoryPoints { get; set; }

    public decimal? EstimatedDevHours { get; set; }

    public decimal? EstimatedTestHours { get; set; }
    
    public int? Priority { get; set; }

    public Feature? Feature { get; set; }

    public ICollection<Task> Tasks { get; set; } = new List<Task>();

    public ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();

    public ICollection<SprintStory> SprintStories { get; set; } = new List<SprintStory>();
}

