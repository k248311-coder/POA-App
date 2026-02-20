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
        services.AddScoped<IProjectWriteService, ProjectWriteService>();
        services.AddScoped<ISprintService, SprintService>();
        services.AddHttpClient<ISupabaseAuthService, SupabaseAuthService>();
        
        // Configure HttpClient for Gemini with better DNS resolution and timeout
        services.AddHttpClient<IGeminiService, GeminiService>(client =>
        {
            client.Timeout = TimeSpan.FromMinutes(5); // Increase timeout for large file processing
        })
        .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            // Allow DNS resolution retries
            UseProxy = true,
            Proxy = null, // Use system proxy settings
        });
        
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}

