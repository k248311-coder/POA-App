using System;

namespace POA.Application.Projects.Dtos;

public record ProjectMemberDto(
    Guid Id,
    Guid ProjectId,
    Guid? UserId,
    string Email,
    string? DisplayName,
    string Role,
    decimal HourlyCost,
    string Status,
    DateTimeOffset CreatedAt
);

public record AddProjectMemberRequestDto(
    string Email,
    string Role, // "developer", "qa"
    decimal HourlyCost
);

public record UpdateProjectMemberRequestDto(
    string Role,
    decimal HourlyCost
);
