using System;
using System.Collections.Generic;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Epic : BaseAuditableEntity
{
    public Guid? ProjectId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int? Priority { get; set; }

    public int? EstimatedPoints { get; set; }

    public Project? Project { get; set; }

    public ICollection<Feature> Features { get; set; } = new List<Feature>();
}

