using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using SystemTask = System.Threading.Tasks.Task;
using Microsoft.EntityFrameworkCore;
using POA.Application.Common.Interfaces;
using POA.Application.Projects.Dtos;
using POA.Application.Projects.Interfaces;
using POA.Domain.Entities;
using TaskEntity = POA.Domain.Entities.Task;

namespace POA.Application.Projects.Services;

public sealed class SprintService(IApplicationDbContext context) : ISprintService
{
    public async System.Threading.Tasks.Task<IReadOnlyList<SprintDto>> GetSprintsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var sprints = await context.Sprints
            .AsNoTracking()
            .Where(s => s.ProjectId == projectId)
            .OrderBy(s => s.StartDate)
            .ThenBy(s => s.Name)
            .Include(s => s.SprintStories)
                .ThenInclude(ss => ss.Story)
                    .ThenInclude(st => st!.Feature)
                        .ThenInclude(f => f!.Epic)
            .ToListAsync(cancellationToken);

        // Get all story IDs in these sprints
        var sprintStoryIds = sprints.SelectMany(s => s.SprintStories.Select(ss => ss.StoryId)).Distinct().ToList();

        // Get all tasks for these stories to calculate status and cost
        var storyTasksMap = await context.Tasks
            .AsNoTracking()
            .Where(t => t.StoryId.HasValue && (sprintStoryIds.Contains(t.StoryId.Value)))
            .ToListAsync(cancellationToken);

        var tasksByStory = storyTasksMap.GroupBy(t => t.StoryId!.Value).ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<SprintDto>();

        foreach (var sprint in sprints)
        {
            var sprintStories = sprint.SprintStories
                .OrderBy(ss => ss.Priority)
                .Select(ss =>
                {
                    var story = ss.Story!;
                    var feature = story.Feature;
                    var epic = feature?.Epic;
                    var tasks = tasksByStory.GetValueOrDefault(story.Id, new List<TaskEntity>());

                    string storyStatusStr = "To Do";
                    if (tasks.Count > 0)
                    {
                        var done = tasks.Count(t => string.Equals(t.Status, "done", StringComparison.OrdinalIgnoreCase));
                        if (done == tasks.Count) storyStatusStr = "Done";
                        else if (tasks.Any(t => string.Equals(t.Status, "in_progress", StringComparison.OrdinalIgnoreCase) ||
                                               string.Equals(t.Status, "in-progress", StringComparison.OrdinalIgnoreCase)))
                            storyStatusStr = "In Progress";
                    }

                    decimal totalCost = tasks.Sum(t => t.TotalCost ?? (t.CostDev ?? 0) + (t.CostTest ?? 0));

                    return new SprintStoryDto(
                        story.Id,
                        story.Title,
                        story.Description,
                        epic?.Title,
                        feature?.Title,
                        story.StoryPoints,
                        story.EstimatedDevHours,
                        story.EstimatedTestHours,
                        storyStatusStr,
                        totalCost,
                        ss.Priority);
                })
                .ToList();

            result.Add(new SprintDto(
                sprint.Id,
                sprint.ProjectId,
                sprint.Name,
                sprint.StartDate,
                sprint.EndDate,
                sprint.Status.ToString(),
                sprintStories));
        }

        return result;
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<BacklogStoryDto>> GetBacklogStoriesAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var stories = await context.Stories
            .AsNoTracking()
            .Where(s =>
                s.Feature != null &&
                s.Feature.Epic != null &&
                s.Feature.Epic.ProjectId == projectId)
            .Include(s => s.Feature)
                .ThenInclude(f => f!.Epic)
            .Include(s => s.Tasks)
            .Include(s => s.SprintStories)
                .ThenInclude(ss => ss.Sprint)
            .ToListAsync(cancellationToken);

        return stories.Select(s =>
        {
            var feature = s.Feature;
            var epic = feature?.Epic;
            var sprintStory = s.SprintStories.FirstOrDefault();
            var totalCost = s.Tasks.Sum(t => t.TotalCost ?? (t.CostDev ?? 0) + (t.CostTest ?? 0));

            string statusStr;
            if (s.Tasks.Count == 0) statusStr = "To Do";
            else
            {
                var done = s.Tasks.Count(t => string.Equals(t.Status, "done", StringComparison.OrdinalIgnoreCase));
                if (done == s.Tasks.Count) statusStr = "Done";
                else
                {
                    var inProgress = s.Tasks.Any(t =>
                        string.Equals(t.Status, "in_progress", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(t.Status, "in-progress", StringComparison.OrdinalIgnoreCase));
                    statusStr = inProgress ? "In Progress" : "To Do";
                }
            }

            return new BacklogStoryDto(
                s.Id,
                s.Title,
                s.Description,
                epic?.Title,
                feature?.Title,
                s.StoryPoints,
                s.EstimatedDevHours,
                s.EstimatedTestHours,
                statusStr,
                totalCost,
                sprintStory != null,
                sprintStory?.SprintId,
                sprintStory?.Sprint?.Name);
        }).OrderBy(s => s.EpicTitle).ThenBy(s => s.FeatureTitle).ThenBy(s => s.Title).ToList();
    }

    public async System.Threading.Tasks.Task<SprintDto> CreateSprintAsync(Guid projectId, CreateSprintRequestDto request, CancellationToken cancellationToken = default)
    {
        var sprint = new Sprint
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = SprintStatus.planned
        };

        context.Sprints.Add(sprint);

        if (request.StoryIds != null && request.StoryIds.Count > 0)
        {
            for (int i = 0; i < request.StoryIds.Count; i++)
            {
                var storyId = request.StoryIds[i];
                context.SprintStories.Add(new SprintStory
                {
                    Id = Guid.NewGuid(),
                    SprintId = sprint.Id,
                    StoryId = storyId,
                    Priority = i + 1
                });

                // Also update tasks for this story
                var tasks = await context.Tasks.Where(t => t.StoryId == storyId).ToListAsync(cancellationToken);
                foreach (var task in tasks)
                {
                    task.SprintId = sprint.Id;
                    task.IsInSprintBacklog = true;
                    task.UpdatedAt = DateTimeOffset.UtcNow;
                }
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        var sprints = await GetSprintsAsync(projectId, cancellationToken);
        return sprints.First(s => s.Id == sprint.Id);
    }

    public async SystemTask DeleteSprintAsync(Guid sprintId, CancellationToken cancellationToken = default)
    {
        var sprint = await context.Sprints
            .Include(s => s.SprintStories)
            .FirstOrDefaultAsync(s => s.Id == sprintId, cancellationToken)
            ?? throw new InvalidOperationException($"Sprint {sprintId} not found.");

        // Clear sprint_stories
        foreach (var ss in sprint.SprintStories)
        {
            context.SprintStories.Remove(ss);
        }

        // Un-assign tasks
        var tasks = await context.Tasks.Where(t => t.SprintId == sprintId).ToListAsync(cancellationToken);
        foreach (var task in tasks)
        {
            task.SprintId = null;
            task.IsInSprintBacklog = false;
            task.UpdatedAt = DateTimeOffset.UtcNow;
        }

        context.Sprints.Remove(sprint);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async SystemTask UpdateSprintStoriesAsync(Guid sprintId, UpdateSprintStoriesRequestDto request, CancellationToken cancellationToken = default)
    {
        var sprint = await context.Sprints
            .Include(s => s.SprintStories)
            .FirstOrDefaultAsync(s => s.Id == sprintId, cancellationToken)
            ?? throw new InvalidOperationException($"Sprint {sprintId} not found.");

        // Remove old associations
        foreach (var ss in sprint.SprintStories)
        {
            context.SprintStories.Remove(ss);
        }

        // Un-assign tasks currently in this sprint
        var oldTasks = await context.Tasks.Where(t => t.SprintId == sprintId).ToListAsync(cancellationToken);
        foreach (var t in oldTasks)
        {
            t.SprintId = null;
            t.IsInSprintBacklog = false;
        }

        // Add new associations
        for (int i = 0; i < request.StoryIds.Count; i++)
        {
            var storyId = request.StoryIds[i];
            context.SprintStories.Add(new SprintStory
            {
                Id = Guid.NewGuid(),
                SprintId = sprintId,
                StoryId = storyId,
                Priority = i + 1
            });

            // Update tasks for these stories
            var newTasks = await context.Tasks.Where(t => t.StoryId == storyId).ToListAsync(cancellationToken);
            foreach (var t in newTasks)
            {
                t.SprintId = sprintId;
                t.IsInSprintBacklog = true;
                t.UpdatedAt = DateTimeOffset.UtcNow;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    public async SystemTask ReorderSprintStoriesAsync(Guid sprintId, ReorderSprintStoriesRequestDto request, CancellationToken cancellationToken = default)
    {
        var sprintStories = await context.SprintStories
            .Where(ss => ss.SprintId == sprintId)
            .ToListAsync(cancellationToken);

        for (int i = 0; i < request.OrderedStoryIds.Count; i++)
        {
            var storyId = request.OrderedStoryIds[i];
            var ss = sprintStories.FirstOrDefault(x => x.StoryId == storyId);
            if (ss != null)
            {
                ss.Priority = i + 1;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
