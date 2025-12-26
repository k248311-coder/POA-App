using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class TestCase : BaseAuditableEntity
{
    public Guid? StoryId { get; set; }

    public string TestCaseText { get; set; } = string.Empty;

    public Story? Story { get; set; }
}

