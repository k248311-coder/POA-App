using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using POA.Application.Auth.Dtos;
using POA.Application.Auth.Interfaces;

namespace POA.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("signup")]
    [ProducesResponseType(typeof(SignupResultDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Signup([FromBody] SignupRequestDto request, CancellationToken cancellationToken)
    {
        var result = await authService.SignupAsync(request, cancellationToken);

        if (!result.Success)
        {
            var message = result.Message ?? "Unable to complete signup.";
            return result.Message?.Contains("exists", StringComparison.OrdinalIgnoreCase) == true
                ? Conflict(message)
                : BadRequest(message);
        }

        return CreatedAtAction(nameof(Signup), new { id = result.UserId }, result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);

        if (!result.Success)
        {
            var message = result.Message ?? "Invalid email or password.";
            return Unauthorized(message);
        }

        return Ok(result);
    }
}

