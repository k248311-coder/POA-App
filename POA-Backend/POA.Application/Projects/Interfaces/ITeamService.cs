using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using POA.Application.Projects.Dtos;

namespace POA.Application.Projects.Interfaces;

public interface ITeamService
{
    Task<ProjectMemberDto> AddMemberAsync(Guid projectId, AddProjectMemberRequestDto request, CancellationToken cancellationToken = default);
    Task UpdateMemberAsync(Guid memberId, UpdateProjectMemberRequestDto request, CancellationToken cancellationToken = default);
    Task RemoveMemberAsync(Guid memberId, CancellationToken cancellationToken = default);
}
