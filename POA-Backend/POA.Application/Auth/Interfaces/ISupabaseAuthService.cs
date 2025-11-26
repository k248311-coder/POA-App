using System.Threading;
using System.Threading.Tasks;

namespace POA.Application.Auth.Interfaces;

public interface ISupabaseAuthService
{
    Task<SupabaseAuthResult> SignUpAsync(string email, string password, string? displayName = null, string? role = null, CancellationToken cancellationToken = default);
    
    Task<SupabaseAuthResult> SignInAsync(string email, string password, CancellationToken cancellationToken = default);
}

public sealed record SupabaseAuthResult(
    bool Success,
    string? SupabaseUserId,
    string? AccessToken,
    string? ErrorMessage);

