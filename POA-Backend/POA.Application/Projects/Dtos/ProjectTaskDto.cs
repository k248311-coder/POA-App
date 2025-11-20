using System;

namespace POA.Application.Projects.Dtos;

public sealed record ProjectTaskDto(
    Guid Id,
    string Title,
    string Status,
    string Type,
    Guid? StoryId,
    string? StoryTitle,
    Guid? EpicId,
    string? EpicTitle,
    Guid? FeatureId,
    string? FeatureTitle,
    Guid? SprintId,
    string? SprintName,
    Guid? AssigneeId,
    string? AssigneeName,
    string? AssigneeRole,
    decimal? DevHours,
    decimal? TestHours,
    decimal? CostDev,
    decimal? CostTest,
    decimal? TotalCost,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);

