using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using POA.Application.Common.Interfaces;
using POA.Application.Projects.Interfaces;
using POA.Infrastructure.FileStorage;
using POA.Infrastructure.Persistence;

namespace POA.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database")
            ?? configuration["Supabase:ConnectionString"]
            ?? throw new InvalidOperationException("Database connection string is not configured.");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, builder =>
            {
                builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            });
            // Don't validate connection on startup - validate on first use
            options.EnableServiceProviderCaching();
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddHttpClient();
        services.AddScoped<IFileStorageService, SupabaseStorageService>();

        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        return services;
    }
}

