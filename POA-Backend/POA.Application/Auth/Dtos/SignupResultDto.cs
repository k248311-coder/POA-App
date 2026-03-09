using System;

namespace POA.Application.Auth.Dtos;

public sealed class SignupResultDto
{
    public bool Success { get; set; }
    public Guid? UserId { get; set; }
    public Guid? TeamId { get; set; }
    public string? Message { get; set; }
    public string? Role { get; set; }

    public static SignupResultDto Failure(string message) => new() 
    { 
        Success = false, 
        Message = message 
    };

    public static SignupResultDto CreateSuccess(Guid userId, Guid teamId, string? role = null, string? message = null) => new() 
    { 
        Success = true, 
        UserId = userId, 
        TeamId = teamId, 
        Role = role, 
        Message = message 
    };
}
