namespace POA.Application.Projects.Dtos;

public sealed class CreateProjectResponseDto
{
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Message { get; set; }
}

