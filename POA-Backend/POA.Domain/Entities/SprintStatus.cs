namespace POA.Domain.Entities;

/// <summary>
/// Matches PostgreSQL enum sprint_status used by sprints.status.
/// DB values: planned, active, completed.
/// </summary>
public enum SprintStatus
{
    planned,
    active,
    completed
}
