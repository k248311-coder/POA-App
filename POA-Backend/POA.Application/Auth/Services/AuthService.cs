using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using POA.Application.Auth.Dtos;
using POA.Application.Auth.Interfaces;
using POA.Application.Common.Interfaces;
using POA.Domain.Entities;

namespace POA.Application.Auth.Services;

public sealed class AuthService(IApplicationDbContext context) : IAuthService
{
    public async Task<SignupResultDto> SignupAsync(SignupRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var name = request.Name?.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return SignupResultDto.Failure("Name is required.");
        }

        var email = request.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email))
        {
            return SignupResultDto.Failure("Email is required.");
        }

        var teamName = request.TeamName?.Trim();
        if (string.IsNullOrWhiteSpace(teamName))
        {
            return SignupResultDto.Failure("Team name is required.");
        }

        var emailExists = await context.Users
            .AsNoTracking()
            .AnyAsync(user => user.Email != null && user.Email.ToLower() == email, cancellationToken);

        if (emailExists)
        {
            return SignupResultDto.Failure("An account with this email already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = name,
            Role = "po"
        };

        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = teamName,
            OwnerId = user.Id
        };

        context.Users.Add(user);
        context.Teams.Add(team);

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            return SignupResultDto.Failure($"Failed to create account: {exception.GetBaseException().Message}");
        }

    return SignupResultDto.CreateSuccess(user.Id, team.Id);
    }
}

