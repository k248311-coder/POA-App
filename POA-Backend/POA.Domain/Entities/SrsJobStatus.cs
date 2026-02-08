namespace POA.Domain.Entities;

/// <summary>
/// Matches PostgreSQL enum llm_prompt_status used by srs_jobs.status.
/// DB values: queued, sent, completed, failed.
/// </summary>
public enum SrsJobStatus
{
    queued,
    sent,
    completed,
    failed
}
