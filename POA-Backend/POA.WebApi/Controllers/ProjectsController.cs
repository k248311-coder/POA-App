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

    [HttpGet("{projectId:guid}/dashboard")]
    [ProducesResponseType(typeof(ProjectDashboardDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDashboard([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var dashboard = await _projectReadService.GetProjectDashboardAsync(projectId, cancellationToken);
        if (dashboard is null)
            return NotFound();
        return Ok(dashboard);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateProjectResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(CreateProjectResponseDto), StatusCodes.Status202Accepted)]
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

        // Async SRS workflow: upload to Supabase → create project + queue job → return 202 (worker processes later)
        if (srsFile != null && srsFile.Length > 0)
        {
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".txt" };
            var fileExtension = Path.GetExtension(srsFile.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest($"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            using (var uploadStream = srsFile.OpenReadStream())
            {
                srsDocumentPath = await _fileStorageService.SaveFileAsync(uploadStream, srsFile.FileName, cancellationToken);
            }
            Console.WriteLine($"[ProjectsController] SRS uploaded to Supabase: {srsDocumentPath}");

            var request = new CreateProjectRequestDto { Name = name };
            var response = await _projectWriteService.CreateProjectAsync(
                request,
                srsDocumentPath,
                geminiJsonResponse: null,
                ownerUserId,
                cancellationToken);

            // 202 Accepted: project and job created; client should poll job/project status
            return AcceptedAtAction(nameof(GetProjectSrsJobStatus), new { projectId = response.ProjectId }, response);
        }

        // No SRS: create project synchronously, return 201
        var createRequest = new CreateProjectRequestDto { Name = name };
        var createResponse = await _projectWriteService.CreateProjectAsync(
            createRequest,
            srsDocumentPath: null,
            geminiJsonResponse: null,
            ownerUserId,
            cancellationToken);

        return CreatedAtAction(nameof(GetProjects), new { userId = ownerUserId }, createResponse);
    }

    /// <summary>Get SRS job status for a project (for polling after 202 Accepted).</summary>
    [HttpGet("{projectId:guid}/srs-job")]
    [ProducesResponseType(typeof(SrsJobStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectSrsJobStatus([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var job = await _projectReadService.GetLatestSrsJobByProjectIdAsync(projectId, cancellationToken);
        if (job == null)
            return NotFound();
        return Ok(job);
    }
}

