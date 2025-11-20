using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using POA.Application.Projects.Dtos;
using POA.Application.Projects.Interfaces;

namespace POA.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProjectsController(IProjectReadService projectReadService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjects([FromQuery] Guid? userId, CancellationToken cancellationToken)
    {
        var projects = await projectReadService.GetProjectSummariesAsync(userId, cancellationToken);
        return Ok(projects);
    }

    [HttpGet("{projectId:guid}/backlog")]
    [ProducesResponseType(typeof(ProjectBacklogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBacklog([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var backlog = await projectReadService.GetProjectBacklogAsync(projectId, cancellationToken);
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
        var tasks = await projectReadService.GetProjectTasksAsync(projectId, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("{projectId:guid}/estimates")]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectEstimateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEstimates([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var estimates = await projectReadService.GetProjectEstimatesAsync(projectId, cancellationToken);
        return Ok(estimates);
    }

    [HttpGet("{projectId:guid}/worklogs")]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectWorklogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorklogs([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var worklogs = await projectReadService.GetProjectWorklogsAsync(projectId, cancellationToken);
        return Ok(worklogs);
    }
}

