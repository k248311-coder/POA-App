using System;

namespace POA.Application.Projects.Dtos;

public sealed record MyStoryDto(
    Guid Id,
    string Title,
    string? EpicTitle,
    string? FeatureTitle,
    string Status,
    decimal EstimatedHours,
    decimal LoggedHours);
