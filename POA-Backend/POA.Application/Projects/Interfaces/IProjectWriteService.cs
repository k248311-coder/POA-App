using System.Threading.Tasks;
using POA.Application.Projects.Dtos;

namespace POA.Application.Projects.Interfaces;

public interface IProjectWriteService
{
    Task<CreateProjectResponseDto> CreateProjectAsync(
        CreateProjectRequestDto request,
        string? srsDocumentPath,
        string? geminiJsonResponse,
        Guid ownerUserId,
        CancellationToken cancellationToken = default);

    /// <summary>Applies Gemini hierarchy (epics/features/stories) to an existing project. Used by the SRS job worker.</summary>
    Task ApplyGeminiHierarchyToProjectAsync(Guid projectId, string geminiJsonResponse, CancellationToken cancellationToken = default);

    System.Threading.Tasks.Task UpdateStoryAsync(Guid storyId, UpdateStoryRequestDto request, CancellationToken cancellationToken = default);
}

