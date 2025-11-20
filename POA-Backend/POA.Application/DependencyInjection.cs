using Microsoft.Extensions.DependencyInjection;
using POA.Application.Auth.Interfaces;
using POA.Application.Auth.Services;
using POA.Application.Projects.Interfaces;
using POA.Application.Projects.Services;

namespace POA.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProjectReadService, ProjectReadService>();
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}

