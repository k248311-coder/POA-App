using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using POA.Application.Auth.Dtos;
using POA.Application.Auth.Interfaces;
using POA.Application.Common.Interfaces;
using POA.Domain.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace POA.Application.Auth.Services;

public sealed class AuthService(
    IApplicationDbContext context,
    ISupabaseAuthService supabaseAuthService) : IAuthService
{
    public async Task<SignupResultDto> SignupAsync(SignupRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var name = request.Name?.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return SignupResultDto.Failure("Name is required.");
        }

        var email = request.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email))
        {
            return SignupResultDto.Failure("Email is required.");
        }

        var role = request.Role?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(role))
        {
             return SignupResultDto.Failure("Role is required.");
        }

        // Check if user already exists in our database
        var existingUser = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(user => user.Email != null && user.Email.ToLower() == email, cancellationToken);

        if (existingUser != null)
        {
            return SignupResultDto.Failure("An account with this email already exists.");
        }

        // Step 1: Create user in Supabase Auth
        // This will create the user in auth.users, and a trigger will copy it to public.users
        var supabaseResult = await supabaseAuthService.SignUpAsync(
            email, 
            request.Password, 
            displayName: name, 
            role: role, 
            cancellationToken);
        
        if (!supabaseResult.Success)
        {
            return SignupResultDto.Failure(supabaseResult.ErrorMessage ?? "Failed to create account.");
        }

        if (string.IsNullOrEmpty(supabaseResult.SupabaseUserId))
        {
            // Include the error message from Supabase if available
            var errorMsg = supabaseResult.ErrorMessage ?? "Failed to create account in authentication service.";
            return SignupResultDto.Failure(errorMsg);
        }

        // Parse the Supabase user ID
        if (!Guid.TryParse(supabaseResult.SupabaseUserId, out var supabaseUserId))
        {
            return SignupResultDto.Failure($"Invalid user ID returned from authentication service: {supabaseResult.SupabaseUserId}");
        }

        // Step 2: Verification (optional step - wait for trigger)
        await System.Threading.Tasks.Task.Delay(300, cancellationToken);
        
        // Link invited project members
        var pendingMembers = await context.ProjectMembers
            .Where(pm => pm.Email.ToLower() == email && pm.UserId == null)
            .ToListAsync(cancellationToken);
            
        if (pendingMembers.Any())
        {
            foreach (var pm in pendingMembers)
            {
                pm.UserId = supabaseUserId;
                pm.Status = "Active";
                pm.UpdatedAt = DateTimeOffset.UtcNow;
            }
            
            await context.SaveChangesAsync(cancellationToken);
        }

        // Return success with user ID. Team ID is null for now as per requirements.
        return SignupResultDto.CreateSuccess(supabaseUserId, Guid.Empty);
    }

    public async Task<LoginResultDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var email = request.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email))
        {
            return LoginResultDto.Failure("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return LoginResultDto.Failure("Password is required.");
        }

        // Authenticate with Supabase Auth
        var supabaseResult = await supabaseAuthService.SignInAsync(email, request.Password, cancellationToken);
        
        if (!supabaseResult.Success)
        {
            return LoginResultDto.Failure(supabaseResult.ErrorMessage ?? "Invalid email or password.");
        }

        if (string.IsNullOrEmpty(supabaseResult.SupabaseUserId))
        {
            return LoginResultDto.Failure("Failed to authenticate user.");
        }

        // Look up user in our database by Supabase user ID
        // The user should exist in public.users via the database trigger
        var supabaseUserId = Guid.Parse(supabaseResult.SupabaseUserId);
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, cancellationToken);

        // If user doesn't exist in public.users, wait a moment for the trigger (in case of timing issue)
        if (user is null)
        {
            await System.Threading.Tasks.Task.Delay(500, cancellationToken);
            user = await context.Users
                .FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, cancellationToken);
        }

        // If still not found, the trigger may have failed or user was created before trigger was set up
        if (user is null)
        {
            return LoginResultDto.Failure("User account found in authentication service but not in database. Please contact support.");
        }

        var role = user.Role switch
        {
            "po" => "po",
            "team_member" or "qa" => "team",
            _ => "team"
        };

        return LoginResultDto.CreateSuccess(user.SupabaseUserId, user.Email ?? email, user.DisplayName, role);
    }
}

