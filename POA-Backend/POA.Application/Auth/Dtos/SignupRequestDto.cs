using System.Collections.Generic;

namespace POA.Application.Auth.Dtos;

public sealed record SignupRequestDto(
    string Name,
    string Email,
    string Password,
    string TeamName,
    string? TeamDescription,
    IReadOnlyList<string> InviteEmails);
