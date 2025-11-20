using System;

namespace POA.Application.Projects.Dtos;

public sealed record ProjectWorklogDto(
    Guid Id,
    Guid? TaskId,
    string? TaskTitle,
    Guid? UserId,
    string? UserName,
    DateOnly Date,
    decimal Hours,
    string? Description,
    DateTimeOffset CreatedAt);

