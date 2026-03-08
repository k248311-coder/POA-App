using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;
using Microsoft.EntityFrameworkCore;
using POA.Application.Common.Interfaces;
using POA.Application.Projects.Dtos;
using POA.Application.Projects.Interfaces;
using POA.Domain.Entities;

namespace POA.Application.Projects.Services;

public sealed class TeamService(IApplicationDbContext context) : ITeamService
{
    public async Task<ProjectMemberDto> AddMemberAsync(Guid projectId, AddProjectMemberRequestDto request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        
        // Check if already a member
        var existingMember = await context.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.Email.ToLower() == email, cancellationToken);
        
        if (existingMember != null)
        {
            throw new InvalidOperationException("User is already a member of this project.");
        }

        // Check if user exists in the system
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == email, cancellationToken);

        var member = new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            UserId = user?.SupabaseUserId,
            Email = email,
            Role = request.Role.ToLower(),
            HourlyCost = request.HourlyCost,
            Status = user != null ? "Active" : "Pending",
            CreatedAt = DateTimeOffset.UtcNow
        };

        context.ProjectMembers.Add(member);
        await context.SaveChangesAsync(cancellationToken);

        return new ProjectMemberDto(
            member.Id,
            member.ProjectId,
            member.UserId,
            member.Email,
            user?.DisplayName,
            member.Role,
            member.HourlyCost,
            member.Status,
            member.CreatedAt);
    }

    public async Task UpdateMemberAsync(Guid memberId, UpdateProjectMemberRequestDto request, CancellationToken cancellationToken = default)
    {
        var member = await context.ProjectMembers
            .FirstOrDefaultAsync(m => m.Id == memberId, cancellationToken);
            
        if (member == null)
        {
            throw new InvalidOperationException("Member not found.");
        }

        member.Role = request.Role.ToLower();
        member.HourlyCost = request.HourlyCost;
        member.UpdatedAt = DateTimeOffset.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveMemberAsync(Guid memberId, CancellationToken cancellationToken = default)
    {
        var member = await context.ProjectMembers
            .FirstOrDefaultAsync(m => m.Id == memberId, cancellationToken);
            
        if (member != null)
        {
            context.ProjectMembers.Remove(member);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
