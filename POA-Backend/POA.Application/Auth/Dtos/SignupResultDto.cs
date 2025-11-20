using System;

namespace POA.Application.Auth.Dtos;

public sealed record SignupResultDto(
    bool Success,
    Guid? UserId,
    Guid? TeamId,
    string? Message)
{
    public static SignupResultDto Failure(string message) =>
        new(false, null, null, message);

    // Factory renamed to avoid a duplicate member name with the 'Success' property
    public static SignupResultDto CreateSuccess(Guid userId, Guid teamId, string? message = null) =>
        new(true, userId, teamId, message);
}

