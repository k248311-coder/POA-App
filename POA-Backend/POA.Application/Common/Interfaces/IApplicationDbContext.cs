using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using POA.Domain.Entities;
using TaskEntity = POA.Domain.Entities.Task;

namespace POA.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Project> Projects { get; }

    DbSet<Epic> Epics { get; }

    DbSet<Feature> Features { get; }

    DbSet<Story> Stories { get; }

    DbSet<TestCase> TestCases { get; }

    DbSet<TaskEntity> Tasks { get; }

    DbSet<TaskHistory> TaskHistory { get; }

    DbSet<Estimate> Estimates { get; }

    DbSet<Sprint> Sprints { get; }

    DbSet<LlmPrompt> LlmPrompts { get; }

    DbSet<SrsJob> SrsJobs { get; }

    DbSet<Team> Teams { get; }

    DbSet<User> Users { get; }

    DbSet<Worklog> Worklogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

