using System.Text.Json.Serialization;

namespace POA.Application.Projects.Dtos;

public sealed class GeminiSrsResponseDto
{
    [JsonPropertyName("project")]
    public string Project { get; set; } = string.Empty;

    [JsonPropertyName("version")]
    public string? Version { get; set; }

    [JsonPropertyName("epics")]
    public List<GeminiEpicDto> Epics { get; set; } = new();
}

public sealed class GeminiEpicDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("features")]
    public List<GeminiFeatureDto> Features { get; set; } = new();
}

public sealed class GeminiFeatureDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("stories")]
    public List<GeminiStoryDto> Stories { get; set; } = new();
}

public sealed class GeminiStoryDto
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("story_points")]
    public int? StoryPoints { get; set; }

    [JsonPropertyName("estimated_dev_hours")]
    public decimal? EstimatedDevHours { get; set; }

    [JsonPropertyName("estimated_test_hours")]
    public decimal? EstimatedTestHours { get; set; }

    [JsonPropertyName("acceptance_criteria")]
    public List<string>? AcceptanceCriteria { get; set; }

    [JsonPropertyName("test_cases")]
    public List<string>? TestCases { get; set; }
}

