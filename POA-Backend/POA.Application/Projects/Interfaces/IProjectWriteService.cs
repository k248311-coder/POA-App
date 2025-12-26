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
}

