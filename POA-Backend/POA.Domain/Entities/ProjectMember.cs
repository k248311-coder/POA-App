using System;
using POA.Domain.Common;

namespace POA.Domain.Entities;

public sealed class ProjectMember : BaseAuditableEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid? UserId { get; set; } // This will map to supabase_user_id in DB
    public User? User { get; set; }

    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "developer", "qa"
    public decimal HourlyCost { get; set; }
    public string Status { get; set; } = "Pending"; // "Active", "Pending"
}
