using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using POA.Application.Common.Interfaces;
using POA.Application.Projects.Dtos;
using POA.Application.Projects.Interfaces;
using POA.Domain.Entities;
using TaskEntity = POA.Domain.Entities.Task;

namespace POA.Application.Projects.Services;

public sealed class ProjectWriteService : IProjectWriteService
{
    private readonly IApplicationDbContext _context;

    public ProjectWriteService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateProjectResponseDto> CreateProjectAsync(
        CreateProjectRequestDto request,
        string? srsDocumentPath,
        string? geminiJsonResponse,
        Guid ownerUserId,
        CancellationToken cancellationToken = default)
    {
        // Create the project
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            OwnerUserId = ownerUserId,
            SrsPath = srsDocumentPath,
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);

        // If we have Gemini JSON response, parse and create the hierarchy
        if (!string.IsNullOrWhiteSpace(geminiJsonResponse))
        {
            Console.WriteLine($"[ProjectWriteService] ====== PROCESSING GEMINI RESPONSE ======");
            Console.WriteLine($"[ProjectWriteService] Gemini JSON response received. Length: {geminiJsonResponse.Length} characters");
            Console.WriteLine($"[ProjectWriteService] First 500 chars: {geminiJsonResponse.Substring(0, Math.Min(500, geminiJsonResponse.Length))}...");
            
            try
            {
                var geminiResponse = JsonSerializer.Deserialize<GeminiSrsResponseDto>(
                    geminiJsonResponse,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (geminiResponse == null)
                {
                    Console.WriteLine($"[ProjectWriteService] ERROR: Deserialized response is null");
                    throw new InvalidOperationException("Failed to deserialize Gemini response");
                }

                Console.WriteLine($"[ProjectWriteService] Deserialization successful. Epics count: {geminiResponse.Epics?.Count ?? 0}");

                if (geminiResponse.Epics != null && geminiResponse.Epics.Count > 0)
                {
                    Console.WriteLine($"[ProjectWriteService] Parsed {geminiResponse.Epics.Count} epics from Gemini response");
                    CreateProjectHierarchyAsync(project, geminiResponse, cancellationToken);
                }
                else
                {
                    Console.WriteLine($"[ProjectWriteService] WARNING: Gemini response has no epics or is null");
                    throw new InvalidOperationException("Gemini response contains no epics. Cannot create hierarchy.");
                }
            }
            catch (Exception ex)
            {
                // Log error and fail project creation if hierarchy is required
                Console.WriteLine($"[ProjectWriteService] ====== ERROR PROCESSING GEMINI RESPONSE ======");
                Console.WriteLine($"[ProjectWriteService] ERROR parsing Gemini response: {ex.Message}");
                Console.WriteLine($"[ProjectWriteService] StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[ProjectWriteService] InnerException: {ex.InnerException.Message}");
                }
                // Re-throw to fail the request if SRS was provided but processing failed
                throw new InvalidOperationException($"Failed to process SRS document: {ex.Message}", ex);
            }
        }
        else if (!string.IsNullOrWhiteSpace(srsDocumentPath))
        {
            // SRS queued: create job row for background worker (no Gemini call in API)
            var job = new SrsJob
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                SrsPath = srsDocumentPath,
                Status = "queued",
                CreatedAt = DateTimeOffset.UtcNow
            };
            _context.SrsJobs.Add(job);
            Console.WriteLine($"[ProjectWriteService] SRS job queued: {job.Id} for project {project.Id}");

            await _context.SaveChangesAsync(cancellationToken);

            return new CreateProjectResponseDto
            {
                ProjectId = project.Id,
                Name = project.Name,
                Message = "Project created. SRS processing has been queued.",
                JobId = job.Id
            };
        }
        else
        {
            Console.WriteLine($"[ProjectWriteService] No Gemini JSON response provided. Project will be created without hierarchy.");
        }

        Console.WriteLine($"[ProjectWriteService] Saving project and hierarchy to database...");
        var savedCount = await _context.SaveChangesAsync(cancellationToken);
        Console.WriteLine($"[ProjectWriteService] Successfully saved {savedCount} changes to database");

        return new CreateProjectResponseDto
        {
            ProjectId = project.Id,
            Name = project.Name,
            Message = "Project created successfully"
        };
    }

    public async System.Threading.Tasks.Task ApplyGeminiHierarchyToProjectAsync(Guid projectId, string geminiJsonResponse, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects.FindAsync([projectId], cancellationToken);
        if (project == null)
            throw new InvalidOperationException($"Project {projectId} not found.");

        var geminiResponse = JsonSerializer.Deserialize<GeminiSrsResponseDto>(
            geminiJsonResponse,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (geminiResponse?.Epics == null || geminiResponse.Epics.Count == 0)
            throw new InvalidOperationException("Gemini response contains no epics.");

        CreateProjectHierarchyAsync(project, geminiResponse, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private void CreateProjectHierarchyAsync(
        Project project,
        GeminiSrsResponseDto geminiResponse,
        CancellationToken cancellationToken)
    {
        // Direct mapping: JSON structure matches database structure
        // JSON Epic → Database Epic
        // JSON Feature → Database Feature
        // JSON Story → Database Story

        Console.WriteLine($"[ProjectWriteService] Creating hierarchy from {geminiResponse.Epics.Count} epics");
        
        int epicCount = 0;
        int featureCount = 0;
        int storyCount = 0;
        int testCaseCount = 0;

        foreach (var jsonEpic in geminiResponse.Epics)
        {
            // Create Epic from JSON Epic
            var epic = new Epic
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Title = jsonEpic.Name,
                Description = jsonEpic.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.Epics.Add(epic);
            epicCount++;
            Console.WriteLine($"[ProjectWriteService] Created Epic: {epic.Title} (ID: {epic.Id})");

            // Process Features within this Epic
            foreach (var jsonFeature in jsonEpic.Features)
            {
                // Create Feature from JSON Feature
                var feature = new Feature
                {
                    Id = Guid.NewGuid(),
                    EpicId = epic.Id,
                    Title = jsonFeature.Name,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Features.Add(feature);
                featureCount++;
                Console.WriteLine($"[ProjectWriteService] Created Feature: {feature.Title} (ID: {feature.Id}, Epic: {epic.Title})");

                // Process Stories within this Feature
                foreach (var jsonStory in jsonFeature.Stories)
                {
                    // Create Story from JSON Story
                    var story = new Story
                    {
                        Id = Guid.NewGuid(),
                        FeatureId = feature.Id,
                        Title = jsonStory.Title,
                        StoryPoints = jsonStory.StoryPoints,
                        EstimatedDevHours = jsonStory.EstimatedDevHours,
                        EstimatedTestHours = jsonStory.EstimatedTestHours,
                        AcceptanceCriteria = jsonStory.AcceptanceCriteria != null
                            ? string.Join("\n", jsonStory.AcceptanceCriteria)
                            : null,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Stories.Add(story);
                    storyCount++;
                    Console.WriteLine($"[ProjectWriteService] Created Story: {story.Title} (ID: {story.Id}, Feature: {feature.Title}, Points: {story.StoryPoints}, Dev: {story.EstimatedDevHours}h, Test: {story.EstimatedTestHours}h)");

                    // Create Test Cases for this Story
                    if (jsonStory.TestCases != null && jsonStory.TestCases.Count > 0)
                    {
                        foreach (var testCaseText in jsonStory.TestCases)
                        {
                            if (!string.IsNullOrWhiteSpace(testCaseText))
                            {
                                var testCase = new TestCase
                                {
                                    Id = Guid.NewGuid(),
                                    StoryId = story.Id,
                                    TestCaseText = testCaseText.Trim(),
                                    CreatedAt = DateTime.UtcNow
                                };

                                _context.TestCases.Add(testCase);
                                testCaseCount++;
                            }
                        }
                        Console.WriteLine($"[ProjectWriteService] Created {jsonStory.TestCases.Count} test cases for story: {story.Title}");
                    }
                }
            }
        }
        
        Console.WriteLine($"[ProjectWriteService] Hierarchy creation complete:");
        Console.WriteLine($"[ProjectWriteService]   Epics: {epicCount}");
        Console.WriteLine($"[ProjectWriteService]   Features: {featureCount}");
        Console.WriteLine($"[ProjectWriteService]   Stories: {storyCount}");
        Console.WriteLine($"[ProjectWriteService]   Test Cases: {testCaseCount}");
    }
}

