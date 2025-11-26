using System.Threading;
using System.Threading.Tasks;
using POA.Application.Auth.Dtos;

namespace POA.Application.Auth.Interfaces;

public interface IAuthService
{
    Task<SignupResultDto> SignupAsync(SignupRequestDto request, CancellationToken cancellationToken = default);
    
    Task<LoginResultDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
}

