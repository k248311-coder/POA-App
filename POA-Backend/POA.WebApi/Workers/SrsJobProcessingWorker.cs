using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using POA.Application.Projects.Interfaces;
using POA.Domain.Entities;
using POA.Infrastructure.Persistence;
using SrsJobStatus = POA.Domain.Entities.SrsJobStatus;

namespace POA.WebApi.Workers;

/// <summary>
/// Polls srs_jobs for status = 'queued', processes each job (Supabase → Gemini → hierarchy → delete file), then marks completed or failed.
/// </summary>
public sealed class SrsJobProcessingWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SrsJobProcessingWorker> _logger;
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);

    public SrsJobProcessingWorker(IServiceProvider serviceProvider, ILogger<SrsJobProcessingWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async System.Threading.Tasks.Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SRS Job Processing Worker started (polling srs_jobs every {Seconds}s).", PollInterval.TotalSeconds);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessOneJobAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SRS worker loop error");
            }

            try
            {
                await System.Threading.Tasks.Task.Delay(PollInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
        _logger.LogInformation("SRS Job Processing Worker stopped.");
    }

    private async System.Threading.Tasks.Task ProcessOneJobAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var fileStorage = scope.ServiceProvider.GetRequiredService<IFileStorageService>();
        var gemini = scope.ServiceProvider.GetRequiredService<IGeminiService>();
        var projectWrite = scope.ServiceProvider.GetRequiredService<IProjectWriteService>();

        var job = await context.SrsJobs
            .Include(j => j.Project)
            .Where(j => j.Status == SrsJobStatus.queued)
            .OrderBy(j => j.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (job == null || job.Project == null)
            return;

        _logger.LogInformation("Processing SRS job {JobId} for project {ProjectId}", job.Id, job.ProjectId);

        job.Status = SrsJobStatus.sent;
        job.StartedAt = DateTimeOffset.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        try
        {
            if (string.IsNullOrWhiteSpace(job.SrsPath))
            {
                throw new InvalidOperationException("Job has no SrsPath.");
            }

            string fileName = System.IO.Path.GetFileName(job.SrsPath) ?? "document.pdf";
            string geminiJson;
            await using (var stream = await fileStorage.GetFileAsync(job.SrsPath, cancellationToken))
            {
                geminiJson = await gemini.ProcessSrsDocumentAsync(stream, fileName, cancellationToken);
            }
            if (string.IsNullOrWhiteSpace(geminiJson))
            {
                throw new InvalidOperationException("Gemini returned empty response.");
            }

            await projectWrite.ApplyGeminiHierarchyToProjectAsync(job.ProjectId!.Value, geminiJson, cancellationToken);

            await fileStorage.DeleteFileAsync(job.SrsPath, cancellationToken);

            var project = job.Project;
            project.SrsPath = null;
            context.Entry(project).Property(nameof(Project.SrsPath)).IsModified = true;
            await context.SaveChangesAsync(cancellationToken);

            job.Status = SrsJobStatus.completed;
            job.CompletedAt = DateTimeOffset.UtcNow;
            job.ResultSummary = "SRS processed successfully; hierarchy created.";
            job.Error = null;
            await context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SRS job {JobId} completed.", job.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SRS job {JobId} failed: {Message}", job.Id, ex.Message);
            job.Status = SrsJobStatus.failed;
            job.CompletedAt = DateTimeOffset.UtcNow;
            job.Error = ex.Message;
            job.ResultSummary = null;
            await context.SaveChangesAsync(cancellationToken);

            try
            {
                if (!string.IsNullOrEmpty(job.SrsPath))
                    await fileStorage.DeleteFileAsync(job.SrsPath, CancellationToken.None);
            }
            catch (Exception cleanupEx)
            {
                _logger.LogWarning(cleanupEx, "Failed to delete SRS file after job failure: {Path}", job.SrsPath);
            }
        }
    }
}
