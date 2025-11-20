using System;
using System.Collections.Generic;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class Team : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public Guid? OwnerId { get; set; }

    public User? Owner { get; set; }

    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

