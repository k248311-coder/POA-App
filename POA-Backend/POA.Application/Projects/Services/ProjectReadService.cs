using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using POA.Application.Common.Interfaces;
using POA.Application.Projects.Dtos;
using POA.Application.Projects.Interfaces;
using TaskEntity = POA.Domain.Entities.Task;

namespace POA.Application.Projects.Services;

public sealed class ProjectReadService(IApplicationDbContext context) : IProjectReadService
{
    public async Task<IReadOnlyList<ProjectSummaryDto>> GetProjectSummariesAsync(
        Guid? userId,
        CancellationToken cancellationToken = default)
    {
        var summaries = await context.Projects
            .AsNoTracking()
            .Select(project => new
            {
                project.Id,
                project.Name,
                project.Description,
                Stories = project.Epics
                    .SelectMany(epic => epic.Features)
                    .SelectMany(feature => feature.Stories),
                Tasks = project.Epics
                    .SelectMany(epic => epic.Features)
                    .SelectMany(feature => feature.Stories)
                    .SelectMany(story => story.Tasks),
                project.CreatedAt
            })
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Description,
                TotalStories = x.Stories.Count(),
                TotalTasks = x.Tasks.Count(),
                CompletedTasks = x.Tasks.Count(task => task.Status == "done"),
                LastUpdated = x.Tasks
                    .Select(task => task.UpdatedAt ?? task.CreatedAt)
                    .Concat(new[] { x.CreatedAt })
                    .Max(),
                TeamMemberCount = x.Tasks
                    .Where(task => task.AssigneeId != null)
                    .Select(task => task.AssigneeId!.Value)
                    .Distinct()
                    .Count()
            })
            .ToListAsync(cancellationToken);

        return summaries
            .Select(summary =>
            {
                var progress = summary.TotalTasks == 0
                    ? 0m
                    : Math.Round(summary.CompletedTasks / (decimal)summary.TotalTasks * 100, 2);

                var status = summary.TotalTasks == 0
                    ? "planning"
                    : summary.CompletedTasks >= summary.TotalTasks
                        ? "completed"
                        : "active";

                var lastUpdated = summary.LastUpdated == default
                    ? (DateTimeOffset?)null
                    : summary.LastUpdated;

                return new ProjectSummaryDto(
                    summary.Id,
                    summary.Name,
                    summary.Description,
                    status,
                    progress,
                    summary.TeamMemberCount,
                    lastUpdated,
                    summary.TotalStories,
                    summary.TotalTasks,
                    summary.CompletedTasks);
            })
            .OrderBy(summary => summary.Name)
            .ToList();
    }

    public async Task<ProjectBacklogDto?> GetProjectBacklogAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var rawProject = await context.Projects
            .AsNoTracking()
            .Where(project => project.Id == projectId)
            .Select(project => new
            {
                project.Id,
                project.Name,
                Epics = project.Epics
                    .OrderBy(epic => epic.Priority)
                    .ThenBy(epic => epic.Title)
                    .Select(epic => new
                    {
                        epic.Id,
                        epic.Title,
                        epic.Description,
                        epic.Priority,
                        epic.EstimatedPoints,
                        Features = epic.Features
                            .OrderBy(feature => feature.Priority)
                            .ThenBy(feature => feature.Title)
                            .Select(feature => new
                            {
                                feature.Id,
                                feature.Title,
                                feature.Description,
                                feature.Priority,
                                Stories = feature.Stories
                                    .OrderByDescending(story => story.CreatedAt)
                                    .Select(story => new
                                    {
                                        story.Id,
                                        story.Title,
                                        story.Description,
                                        story.AcceptanceCriteria,
                                        story.StoryPoints,
                                        story.EstimatedDevHours,
                                        story.EstimatedTestHours,
                                        Tasks = story.Tasks
                                            .OrderBy(task => task.Status)
                                            .ThenBy(task => task.Title)
                                            .Select(task => new
                                            {
                                                task.Id,
                                                task.Title,
                                                task.Status,
                                                task.DevHours,
                                                task.TestHours,
                                                task.CostDev,
                                                task.CostTest,
                                                TotalCost = task.TotalCost ?? (task.CostDev ?? 0) + (task.CostTest ?? 0)
                                            })
                                            .ToList(),
                                        TestCases = story.TestCases
                                            .OrderBy(tc => tc.CreatedAt)
                                            .Select(tc => new
                                            {
                                                tc.Id,
                                                tc.TestCaseText
                                            })
                                            .ToList()
                                    })
                                    .ToList()
                            })
                            .ToList()
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (rawProject is null)
        {
            return null;
        }

        var epics = rawProject.Epics
            .Select(epic =>
            {
                var features = epic.Features
                    .Select(feature =>
                    {
                        var stories = feature.Stories
                            .Select(story =>
                            {
                                var acceptanceCriteria = story.AcceptanceCriteria;
                                var tasks = story.Tasks
                                    .Select(task => new ProjectBacklogTaskDto(
                                        task.Id,
                                        task.Title,
                                        task.Status,
                                        task.DevHours,
                                        task.TestHours,
                                        task.CostDev,
                                        task.CostTest,
                                        task.TotalCost))
                                    .ToList();

                                var testCases = story.TestCases
                                    .Select(tc => new ProjectBacklogTestCaseDto(
                                        tc.Id,
                                        tc.TestCaseText))
                                    .ToList();

                                var storyStatus = ResolveStoryStatus(tasks, story.StoryPoints);
                                var totalCost = tasks.Sum(task => task.TotalCost ?? 0);

                                return new ProjectBacklogStoryDto(
                                    story.Id,
                                    story.Title,
                                    story.Description,
                                    acceptanceCriteria,
                                    story.StoryPoints,
                                    story.EstimatedDevHours,
                                    story.EstimatedTestHours,
                                    storyStatus,
                                    totalCost,
                                    tasks,
                                    testCases);
                            })
                            .ToList();

                        return new ProjectBacklogFeatureDto(
                            feature.Id,
                            feature.Title,
                            feature.Description,
                            feature.Priority,
                            stories);
                    })
                    .ToList();

                return new ProjectBacklogEpicDto(
                    epic.Id,
                    epic.Title,
                    epic.Description,
                    epic.Priority,
                    epic.EstimatedPoints,
                    features);
            })
            .ToList();

        return new ProjectBacklogDto(rawProject.Id, rawProject.Name, epics);
    }

    public async Task<IReadOnlyList<ProjectTaskDto>> GetProjectTasksAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var query = context.Tasks
            .AsNoTracking()
            .Where(task =>
                (task.Story != null &&
                 task.Story.Feature != null &&
                 task.Story.Feature.Epic != null &&
                 task.Story.Feature.Epic.ProjectId == projectId) ||
                (task.Sprint != null && task.Sprint.ProjectId == projectId))
            .Select(task => new
            {
                Task = task,
                Story = task.Story,
                Feature = task.Story != null ? task.Story.Feature : null,
                Epic = task.Story != null && task.Story.Feature != null ? task.Story.Feature.Epic : null,
                Sprint = task.Sprint,
                Assignee = task.Assignee
            });

        var ordered = query
            .OrderByDescending(x => x.Task.UpdatedAt ?? x.Task.CreatedAt)
            .ThenBy(x => x.Task.Title);

        var tasks = await ordered
            .Select(x => new ProjectTaskDto(
                x.Task.Id,
                x.Task.Title,
                x.Task.Status,
                x.Task.Type,
                x.Task.StoryId,
                x.Story != null ? x.Story.Title : null,
                x.Epic != null ? x.Epic.Id : null,
                x.Epic != null ? x.Epic.Title : null,
                x.Feature != null ? x.Feature.Id : null,
                x.Feature != null ? x.Feature.Title : null,
                x.Task.SprintId,
                x.Sprint != null ? x.Sprint.Name : null,
                x.Task.AssigneeId,
                x.Assignee != null ? x.Assignee.DisplayName ?? x.Assignee.Email : null,
                x.Task.AssigneeRole,
                x.Task.DevHours,
                x.Task.TestHours,
                x.Task.CostDev,
                x.Task.CostTest,
                x.Task.TotalCost ?? (x.Task.CostDev ?? 0) + (x.Task.CostTest ?? 0),
                x.Task.CreatedAt,
                x.Task.UpdatedAt))
            .ToListAsync(cancellationToken);

        return tasks;
    }

    public async Task<IReadOnlyList<ProjectEstimateDto>> GetProjectEstimatesAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var estimates = await context.Estimates
            .AsNoTracking()
            .Where(estimate =>
                estimate.Task != null &&
                (
                    (estimate.Task.Story != null &&
                     estimate.Task.Story.Feature != null &&
                     estimate.Task.Story.Feature.Epic != null &&
                     estimate.Task.Story.Feature.Epic.ProjectId == projectId)
                    ||
                    (estimate.Task.Sprint != null && estimate.Task.Sprint.ProjectId == projectId)
                ))
            .Select(estimate => new
            {
                Estimate = estimate,
                Task = estimate.Task,
                User = estimate.User
            })
            .Select(x => new ProjectEstimateDto(
                x.Estimate.Id,
                x.Estimate.TaskId,
                x.Task != null ? x.Task.Title : null,
                x.Estimate.UserId,
                x.User != null ? x.User.DisplayName ?? x.User.Email : null,
                x.Estimate.Points,
                x.Estimate.Note,
                x.Estimate.CreatedAt))
            .OrderByDescending(estimate => estimate.CreatedAt)
            .ToListAsync(cancellationToken);

        return estimates;
    }

    public async Task<IReadOnlyList<ProjectWorklogDto>> GetProjectWorklogsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var query = context.Worklogs
            .AsNoTracking()
            .Where(worklog =>
                worklog.Task != null &&
                (
                    (worklog.Task.Story != null &&
                     worklog.Task.Story.Feature != null &&
                     worklog.Task.Story.Feature.Epic != null &&
                     worklog.Task.Story.Feature.Epic.ProjectId == projectId)
                    ||
                    (worklog.Task.Sprint != null && worklog.Task.Sprint.ProjectId == projectId)
                ))
            .Select(worklog => new
            {
                Worklog = worklog,
                Task = worklog.Task,
                User = worklog.User
            });

        var ordered = query
            .OrderByDescending(x => x.Worklog.Date)
            .ThenByDescending(x => x.Worklog.CreatedAt);

        var worklogs = await ordered
            .Select(x => new ProjectWorklogDto(
                x.Worklog.Id,
                x.Worklog.TaskId,
                x.Task != null ? x.Task.Title : null,
                x.Worklog.UserId,
                x.User != null ? x.User.DisplayName ?? x.User.Email : null,
                x.Worklog.Date,
                x.Worklog.Hours,
                x.Worklog.Description,
                x.Worklog.CreatedAt))
            .ToListAsync(cancellationToken);

        return worklogs;
    }

    public async Task<ProjectDashboardDto?> GetProjectDashboardAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var backlog = await GetProjectBacklogAsync(projectId, cancellationToken);
        if (backlog is null)
            return null;

        var tasks = await GetProjectTasksAsync(projectId, cancellationToken);
        var worklogs = await GetProjectWorklogsAsync(projectId, cancellationToken);

        var stories = backlog.Epics
            .SelectMany(epic => epic.Features)
            .SelectMany(feature => feature.Stories)
            .ToList();

        var totalStories = stories.Count;
        var totalDevHours = stories.Sum(s => s.EstimatedDevHours ?? 0);
        var totalQAHours = stories.Sum(s => s.EstimatedTestHours ?? 0);
        var totalCost = stories.Sum(s => s.TotalCost);

        var completedTasks = tasks.Where(t => string.Equals(t.Status, "done", StringComparison.OrdinalIgnoreCase)).ToList();
        var burnupData = BuildBurnupData(completedTasks, tasks.Count);

        var recentActivity = worklogs
            .OrderByDescending(w => w.CreatedAt)
            .Take(8)
            .Select(w => new DashboardActivityDto(
                w.UserName ?? "Someone",
                $"Logged {w.Hours}h{(w.TaskTitle != null ? $" on {w.TaskTitle}" : "")}",
                w.CreatedAt.ToString("o")))
            .ToList();

        return new ProjectDashboardDto(
            totalStories,
            totalDevHours,
            totalQAHours,
            totalCost,
            burnupData,
            recentActivity);
    }

    private static IReadOnlyList<BurnupPointDto> BuildBurnupData(IReadOnlyList<ProjectTaskDto> completedTasks, int totalTasks)
    {
        if (totalTasks == 0)
            return Array.Empty<BurnupPointDto>();

        var taskDates = completedTasks
            .Select(t => t.UpdatedAt ?? t.CreatedAt)
            .Where(d => d != default)
            .Select(d => d.DateTime)
            .ToList();

        if (taskDates.Count == 0)
            return new List<BurnupPointDto> { new BurnupPointDto("Current", totalTasks, 0) };

        static DateTime GetWeekStart(DateTime d)
        {
            var diff = (7 + (d.DayOfWeek - DayOfWeek.Monday)) % 7;
            return d.Date.AddDays(-diff);
        }

        var byWeek = taskDates
            .GroupBy(GetWeekStart)
            .ToDictionary(g => g.Key, g => g.Count());

        var weeks = byWeek.Keys.OrderBy(k => k).ToList();
        var cumulative = 0;
        var result = new List<BurnupPointDto>();
        foreach (var weekStart in weeks)
        {
            cumulative += byWeek[weekStart];
            var label = weekStart.ToString("MMM d", System.Globalization.CultureInfo.InvariantCulture);
            result.Add(new BurnupPointDto(label, totalTasks, cumulative));
        }

        return result;
    }

    public async Task<SrsJobStatusDto?> GetLatestSrsJobByProjectIdAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var job = await context.SrsJobs
            .AsNoTracking()
            .Where(j => j.ProjectId == projectId)
            .OrderByDescending(j => j.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (job is null)
            return null;

        return new SrsJobStatusDto
        {
            Id = job.Id,
            ProjectId = job.ProjectId,
            Status = job.Status.ToString(),
            StartedAt = job.StartedAt,
            CompletedAt = job.CompletedAt,
            ResultSummary = job.ResultSummary,
            Error = job.Error,
            CreatedAt = job.CreatedAt
        };
    }



    private static string ResolveStoryStatus(
        IReadOnlyCollection<ProjectBacklogTaskDto> tasks,
        int? storyPoints)
    {
        if (tasks.Count == 0)
        {
            return storyPoints is > 0 ? "Planned" : "To Do";
        }

        var completed = tasks.Count(task =>
            string.Equals(task.Status, "done", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(task.Status, "completed", StringComparison.OrdinalIgnoreCase));

        if (completed == tasks.Count)
        {
            return "Done";
        }

        var inProgress = tasks.Count(task =>
            string.Equals(task.Status, "in_progress", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(task.Status, "in progress", StringComparison.OrdinalIgnoreCase));

        return inProgress > 0 ? "In Progress" : "To Do";
    }
}

