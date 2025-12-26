using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using POA.Application.Projects.Dtos;
using POA.Application.Projects.Interfaces;

namespace POA.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProjectsController : ControllerBase
{
    private readonly IProjectReadService _projectReadService;
    private readonly IProjectWriteService _projectWriteService;
    private readonly IGeminiService _geminiService;
    private readonly IFileStorageService _fileStorageService;

    public ProjectsController(
        IProjectReadService projectReadService,
        IProjectWriteService projectWriteService,
        IGeminiService geminiService,
        IFileStorageService fileStorageService)
    {
        _projectReadService = projectReadService;
        _projectWriteService = projectWriteService;
        _geminiService = geminiService;
        _fileStorageService = fileStorageService;
    }
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjects([FromQuery] Guid? userId, CancellationToken cancellationToken)
    {
        var projects = await _projectReadService.GetProjectSummariesAsync(userId, cancellationToken);
        return Ok(projects);
    }

    [HttpGet("{projectId:guid}/backlog")]
    [ProducesResponseType(typeof(ProjectBacklogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBacklog([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var backlog = await _projectReadService.GetProjectBacklogAsync(projectId, cancellationToken);
        if (backlog is null)
        {
            return NotFound();
        }

        return Ok(backlog);
    }

    [HttpGet("{projectId:guid}/tasks")]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectTaskDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTasks([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var tasks = await _projectReadService.GetProjectTasksAsync(projectId, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{projectId:guid}/estimates")]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectEstimateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEstimates([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var estimates = await _projectReadService.GetProjectEstimatesAsync(projectId, cancellationToken);
        return Ok(estimates);
    }

    [HttpGet("{projectId:guid}/worklogs")]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectWorklogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorklogs([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var worklogs = await _projectReadService.GetProjectWorklogsAsync(projectId, cancellationToken);
        return Ok(worklogs);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateProjectResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProject(
        [FromForm] string name,
        [FromForm] IFormFile? srsFile,
        [FromQuery] Guid ownerUserId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest("Project name is required.");
        }

        string? srsDocumentPath = null;
        string? geminiJsonResponse = null;

        // Handle file upload if provided
        if (srsFile != null && srsFile.Length > 0)
        {
            // Validate file type
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".txt" };
            var fileExtension = Path.GetExtension(srsFile.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest($"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            // Save file and process with Gemini
            // Note: We need to read the stream twice - once for saving, once for Gemini
            // For large files, consider buffering or using a different approach
            byte[] fileBytes;
            using (var fileStream = srsFile.OpenReadStream())
            {
                using (var memoryStream = new MemoryStream())
                {
                    await fileStream.CopyToAsync(memoryStream, cancellationToken);
                    fileBytes = memoryStream.ToArray();
                }
            }

            // Save file
            using (var fileStream = new MemoryStream(fileBytes))
            {
                srsDocumentPath = await _fileStorageService.SaveFileAsync(fileStream, srsFile.FileName, cancellationToken);
            }

            // Process document with Gemini
            Console.WriteLine($"[ProjectsController] ====== STARTING SRS PROCESSING ======");
            Console.WriteLine($"[ProjectsController] Processing SRS file with Gemini: {srsFile.FileName} ({srsFile.Length} bytes)");
            try
            {
                using (var fileStream = new MemoryStream(fileBytes))
                {
                    geminiJsonResponse = await _geminiService.ProcessSrsDocumentAsync(fileStream, srsFile.FileName, cancellationToken);
                    Console.WriteLine($"[ProjectsController] Gemini processing successful. Response length: {geminiJsonResponse?.Length ?? 0}");
                    if (string.IsNullOrWhiteSpace(geminiJsonResponse))
                    {
                        throw new InvalidOperationException("Gemini API returned empty response");
                    }
                }
            }
            catch (Exception ex)
            {
                // Log full error details and fail project creation if SRS processing fails
                Console.WriteLine($"[ProjectsController] ====== ERROR PROCESSING SRS ======");
                Console.WriteLine($"[ProjectsController]   File: {srsFile.FileName}");
                Console.WriteLine($"[ProjectsController]   Error: {ex.Message}");
                Console.WriteLine($"[ProjectsController]   StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[ProjectsController]   InnerException: {ex.InnerException.Message}");
                }
                // Fail the request if SRS processing fails
                return BadRequest($"Failed to process SRS document: {ex.Message}");
            }
        }

        // Create project
        var request = new CreateProjectRequestDto { Name = name };
        var response = await _projectWriteService.CreateProjectAsync(
            request,
            srsDocumentPath,
            geminiJsonResponse,
            ownerUserId,
            cancellationToken);

        return CreatedAtAction(nameof(GetProjects), new { userId = ownerUserId }, response);
    }
}

