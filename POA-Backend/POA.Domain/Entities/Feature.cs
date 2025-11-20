using System;
using System.Collections.Generic;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Feature : BaseAuditableEntity
{
    public Guid? EpicId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int? Priority { get; set; }

    public Epic? Epic { get; set; }

    public ICollection<Story> Stories { get; set; } = new List<Story>();
}

