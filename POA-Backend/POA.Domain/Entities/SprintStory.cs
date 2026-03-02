using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class SprintStory : BaseEntity
{
    public Guid SprintId { get; set; }
    
    public Guid StoryId { get; set; }
    
    public int Priority { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    public Sprint? Sprint { get; set; }
    
    public Story? Story { get; set; }
}
