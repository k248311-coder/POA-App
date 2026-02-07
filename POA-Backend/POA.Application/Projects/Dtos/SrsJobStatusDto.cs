namespace POA.Application.Projects.Dtos;

public sealed class SrsJobStatusDto
{
    public Guid Id { get; set; }
    public Guid? ProjectId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? ResultSummary { get; set; }
    public string? Error { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
