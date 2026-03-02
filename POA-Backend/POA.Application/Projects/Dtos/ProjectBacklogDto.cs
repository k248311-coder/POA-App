using System;
using System.Collections.Generic;

namespace POA.Application.Projects.Dtos;

public sealed record ProjectBacklogDto(
    Guid Id,
    string Name,
    IReadOnlyList<ProjectBacklogEpicDto> Epics);

public sealed record ProjectBacklogEpicDto(
    Guid Id,
    string Title,
    string? Description,
    int? Priority,
    int? EstimatedPoints,
    IReadOnlyList<ProjectBacklogFeatureDto> Features);

public sealed record ProjectBacklogFeatureDto(
    Guid Id,
    string Title,
    string? Description,
    int? Priority,
    IReadOnlyList<ProjectBacklogStoryDto> Stories);

public sealed record ProjectBacklogStoryDto(
    Guid Id,
    string Title,
    string? Description,
    IReadOnlyList<string> AcceptanceCriteria,
    int? StoryPoints,
    decimal? EstimatedDevHours,
    decimal? EstimatedTestHours,
    string Status,
    decimal TotalCost,
    IReadOnlyList<ProjectBacklogTaskDto> Tasks,
    IReadOnlyList<ProjectBacklogTestCaseDto> TestCases);

public sealed record ProjectBacklogTestCaseDto(
    Guid Id,
    string TestCaseText);

public sealed record ProjectBacklogTaskDto(
    Guid Id,
    string Title,
    string Status,
    decimal? DevHours,
    decimal? TestHours,
    decimal? CostDev,
    decimal? CostTest,
    decimal? TotalCost);

