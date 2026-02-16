using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using POA.Application.Projects.Dtos;

namespace POA.Application.Projects.Interfaces;

public interface IProjectReadService
{
    Task<IReadOnlyList<ProjectSummaryDto>> GetProjectSummariesAsync(Guid? userId, CancellationToken cancellationToken = default);

    Task<ProjectBacklogDto?> GetProjectBacklogAsync(Guid projectId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ProjectTaskDto>> GetProjectTasksAsync(Guid projectId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ProjectEstimateDto>> GetProjectEstimatesAsync(Guid projectId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ProjectWorklogDto>> GetProjectWorklogsAsync(Guid projectId, CancellationToken cancellationToken = default);

    Task<ProjectDashboardDto?> GetProjectDashboardAsync(Guid projectId, CancellationToken cancellationToken = default);

    Task<SrsJobStatusDto?> GetLatestSrsJobByProjectIdAsync(Guid projectId, CancellationToken cancellationToken = default);
}

