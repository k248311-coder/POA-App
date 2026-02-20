using System;
using System.Collections.Generic;

namespace POA.Application.Projects.Dtos;

public sealed record SprintDto(
    Guid Id,
    Guid? ProjectId,
    string Name,
    DateOnly? StartDate,
    DateOnly? EndDate,
    string Status,
    IReadOnlyList<SprintStoryDto> Stories);

public sealed record SprintStoryDto(
    Guid Id,
    string Title,
    string? Description,
    string? EpicTitle,
    string? FeatureTitle,
    int? StoryPoints,
    decimal? EstimatedDevHours,
    decimal? EstimatedTestHours,
    string StoryStatus,
    decimal TotalCost,
    int Priority);

public sealed record CreateSprintRequestDto(
    string Name,
    DateOnly? StartDate,
    DateOnly? EndDate,
    IReadOnlyList<Guid>? StoryIds);

public sealed record UpdateSprintStoriesRequestDto(
    IReadOnlyList<Guid> StoryIds);

public sealed record ReorderSprintStoriesRequestDto(
    IReadOnlyList<Guid> OrderedStoryIds);

public sealed record BacklogStoryDto(
    Guid Id,
    string Title,
    string? Description,
    string? EpicTitle,
    string? FeatureTitle,
    int? StoryPoints,
    decimal? EstimatedDevHours,
    decimal? EstimatedTestHours,
    string Status,
    decimal TotalCost,
    bool IsInSprint,
    Guid? CurrentSprintId,
    string? CurrentSprintName);
