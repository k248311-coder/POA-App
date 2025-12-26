using Microsoft.EntityFrameworkCore;
using POA.Application.Common.Interfaces;
using POA.Domain.Entities;

namespace POA.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Project> Projects => Set<Project>();

    public DbSet<Epic> Epics => Set<Epic>();

    public DbSet<Feature> Features => Set<Feature>();

    public DbSet<Story> Stories => Set<Story>();

    public DbSet<TestCase> TestCases => Set<TestCase>();

    public DbSet<Domain.Entities.Task> Tasks => Set<Domain.Entities.Task>();

    public DbSet<TaskHistory> TaskHistory => Set<TaskHistory>();

    public DbSet<Estimate> Estimates => Set<Estimate>();

    public DbSet<Sprint> Sprints => Set<Sprint>();

    public DbSet<LlmPrompt> LlmPrompts => Set<LlmPrompt>();

    public DbSet<SrsJob> SrsJobs => Set<SrsJob>();

    public DbSet<Team> Teams => Set<Team>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Worklog> Worklogs => Set<Worklog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}

