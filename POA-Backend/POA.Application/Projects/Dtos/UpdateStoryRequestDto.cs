using System;
using System.Collections.Generic;

namespace POA.Application.Projects.Dtos;

public sealed record UpdateStoryRequestDto(
    string Title,
    string? Description,
    IReadOnlyList<string> AcceptanceCriteria,
    int? StoryPoints,
    decimal? EstimatedDevHours,
    decimal? EstimatedTestHours,
    string Status,
    IReadOnlyList<UpdateStoryTaskDto> Tasks,
    IReadOnlyList<UpdateStoryTestCaseDto> TestCases);

public sealed record UpdateStoryTaskDto(
    Guid? Id,
    string Title,
    string Status,
    decimal? DevHours,
    decimal? TestHours);

public sealed record UpdateStoryTestCaseDto(
    Guid? Id,
    string TestCaseText);
