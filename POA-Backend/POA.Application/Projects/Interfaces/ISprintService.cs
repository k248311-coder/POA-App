using System;
using System.Collections.Generic;
using System.Threading;
using POA.Application.Projects.Dtos;

namespace POA.Application.Projects.Interfaces;

public interface ISprintService
{
    /// <summary>Get all sprints for a project with their stories.</summary>
    System.Threading.Tasks.Task<IReadOnlyList<SprintDto>> GetSprintsAsync(Guid projectId, CancellationToken cancellationToken = default);

    /// <summary>Get all stories for a project with sprint membership info (for backlog panel).</summary>
    System.Threading.Tasks.Task<IReadOnlyList<BacklogStoryDto>> GetBacklogStoriesAsync(Guid projectId, CancellationToken cancellationToken = default);

    /// <summary>Create a new sprint, optionally pre-populating with story IDs.</summary>
    System.Threading.Tasks.Task<SprintDto> CreateSprintAsync(Guid projectId, CreateSprintRequestDto request, CancellationToken cancellationToken = default);

    /// <summary>Delete a sprint (stories become unassigned).</summary>
    System.Threading.Tasks.Task DeleteSprintAsync(Guid sprintId, CancellationToken cancellationToken = default);

    /// <summary>Replace all stories in a sprint with the provided list.</summary>
    System.Threading.Tasks.Task UpdateSprintStoriesAsync(Guid sprintId, UpdateSprintStoriesRequestDto request, CancellationToken cancellationToken = default);

    /// <summary>Reorder stories within a sprint by providing an ordered list of story IDs.</summary>
    System.Threading.Tasks.Task ReorderSprintStoriesAsync(Guid sprintId, ReorderSprintStoriesRequestDto request, CancellationToken cancellationToken = default);
}
