using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using POA.Application.Projects.Dtos;
using POA.Application.Projects.Interfaces;

namespace POA.WebApi.Controllers;

[ApiController]
[Route("api/projects/{projectId:guid}/sprints")]
public sealed class SprintsController(ISprintService sprintService) : ControllerBase
{
    /// <summary>Get all sprints for a project with their stories.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SprintDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSprints([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var sprints = await sprintService.GetSprintsAsync(projectId, cancellationToken);
        return Ok(sprints);
    }

    /// <summary>Get all backlog stories for a project (with sprint membership info).</summary>
    [HttpGet("backlog-stories")]
    [ProducesResponseType(typeof(IReadOnlyList<BacklogStoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBacklogStories([FromRoute] Guid projectId, CancellationToken cancellationToken)
    {
        var stories = await sprintService.GetBacklogStoriesAsync(projectId, cancellationToken);
        return Ok(stories);
    }

    /// <summary>Create a new sprint for a project.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSprint(
        [FromRoute] Guid projectId,
        [FromBody] CreateSprintRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Sprint name is required.");

        var sprint = await sprintService.CreateSprintAsync(projectId, request, cancellationToken);
        return CreatedAtAction(nameof(GetSprints), new { projectId }, sprint);
    }

    /// <summary>Delete a sprint (stories become unassigned from sprint).</summary>
    [HttpDelete("{sprintId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSprint(
        [FromRoute] Guid projectId,
        [FromRoute] Guid sprintId,
        CancellationToken cancellationToken)
    {
        try
        {
            await sprintService.DeleteSprintAsync(sprintId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>Update (replace) the set of stories in a sprint.</summary>
    [HttpPut("{sprintId:guid}/stories")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSprintStories(
        [FromRoute] Guid projectId,
        [FromRoute] Guid sprintId,
        [FromBody] UpdateSprintStoriesRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            await sprintService.UpdateSprintStoriesAsync(sprintId, request, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>Reorder stories within a sprint (priority ordering).</summary>
    [HttpPut("{sprintId:guid}/stories/reorder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderSprintStories(
        [FromRoute] Guid projectId,
        [FromRoute] Guid sprintId,
        [FromBody] ReorderSprintStoriesRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            await sprintService.ReorderSprintStoriesAsync(sprintId, request, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            return NotFound(ex.Message);
        }
    }
}
