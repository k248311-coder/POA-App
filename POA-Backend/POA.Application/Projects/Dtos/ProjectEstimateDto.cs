using System;

namespace POA.Application.Projects.Dtos;

public sealed record ProjectEstimateDto(
    Guid Id,
    Guid? TaskId,
    string? TaskTitle,
    Guid? UserId,
    string? UserName,
    int? Points,
    string? Note,
    DateTimeOffset CreatedAt);

