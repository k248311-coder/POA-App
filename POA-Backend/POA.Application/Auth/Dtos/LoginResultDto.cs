using System;

namespace POA.Application.Auth.Dtos;

public sealed record LoginResultDto(
    bool Success,
    Guid? UserId,
    string? Email,
    string? DisplayName,
    string? Role,
    string? Message)
{
    public static LoginResultDto Failure(string message) =>
        new(false, null, null, null, null, message);

    public static LoginResultDto CreateSuccess(Guid userId, string email, string? displayName, string role, string? message = null) =>
        new(true, userId, email, displayName, role, message);
}

