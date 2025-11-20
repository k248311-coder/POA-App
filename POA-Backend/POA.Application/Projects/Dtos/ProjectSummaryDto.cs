using System;

namespace POA.Application.Projects.Dtos;

public sealed record ProjectSummaryDto(
    Guid Id,
    string Name,
    string? Description,
    string Status,
    decimal ProgressPercent,
    int TeamMemberCount,
    DateTimeOffset? LastUpdated,
    int TotalStories,
    int TotalTasks,
    int CompletedTasks);

