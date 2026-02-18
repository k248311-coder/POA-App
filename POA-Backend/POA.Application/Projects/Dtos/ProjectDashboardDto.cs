namespace POA.Application.Projects.Dtos;

/// <summary>Aggregated data for the project dashboard.</summary>
public sealed record ProjectDashboardDto(
    int TotalStories,
    decimal TotalDevHours,
    decimal TotalQAHours,
    decimal TotalCost,
    IReadOnlyList<BurnupPointDto> BurnupData,
    IReadOnlyList<DashboardActivityDto> RecentActivity);

/// <summary>Single point for the burnup chart (week label, planned total, cumulative actual).</summary>
public sealed record BurnupPointDto(string Week, int Planned, int Actual);

/// <summary>Single recent activity entry for the dashboard.</summary>
public sealed record DashboardActivityDto(
    string UserName,
    string Action,
    string CreatedAtIso);
