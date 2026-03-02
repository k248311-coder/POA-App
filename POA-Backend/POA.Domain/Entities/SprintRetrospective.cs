using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class SprintRetrospective : BaseEntity
{
    public Guid SprintId { get; set; }

    public string? WhatWentWell { get; set; }

    public string? WhatDidntGoWell { get; set; }

    public string? IdeasGoingForward { get; set; }

    public string? ActionItems { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Sprint? Sprint { get; set; }
}
