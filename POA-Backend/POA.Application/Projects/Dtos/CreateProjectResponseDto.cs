namespace POA.Application.Projects.Dtos;

public sealed class CreateProjectResponseDto
{
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Message { get; set; }
    /// <summary>Set when SRS is queued (202 Accepted); use for polling job status.</summary>
    public Guid? JobId { get; set; }
}

