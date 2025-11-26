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

        var teamName = request.TeamName?.Trim();
        if (string.IsNullOrWhiteSpace(teamName))
        {
            return SignupResultDto.Failure("Team name is required.");
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
            role: "po", 
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

        // Step 2: Supabase creates user in auth.users (done by SignUpAsync)
        // Step 3: Database trigger copies user to public.users (handled by database trigger)
        // Step 4: Create team - wait a moment for the trigger to complete, then verify user exists in public.users
        
        // Wait a brief moment for the database trigger to complete
        await System.Threading.Tasks.Task.Delay(100, cancellationToken);
        
        // Verify the user exists in public.users (created by trigger)
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, cancellationToken);
        
        if (user == null)
        {
            // User should have been created by trigger, but it's not there yet
            // Try waiting a bit longer and retry
            await System.Threading.Tasks.Task.Delay(500, cancellationToken);
            user = await context.Users
                .FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, cancellationToken);
            
            if (user == null)
            {
                return SignupResultDto.Failure("User was created in auth.users but not found in public.users. Please check your database trigger configuration.");
            }
        }

        // Create team with reference to the user
        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = teamName,
            OwnerId = user.SupabaseUserId
        };

        context.Teams.Add(team);

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            return SignupResultDto.Failure($"Failed to create team: {exception.GetBaseException().Message}");
        }

        return SignupResultDto.CreateSuccess(user.SupabaseUserId, team.Id);
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

