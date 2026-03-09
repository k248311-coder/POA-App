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
using Microsoft.Extensions.Logging;

namespace POA.Application.Auth.Services;

public sealed class AuthService(
    IApplicationDbContext context,
    ISupabaseAuthService supabaseAuthService,
    ILogger<AuthService> logger) : IAuthService
{
    public async Task<SignupResultDto> SignupAsync(SignupRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var name = request.Name?.Trim() ?? string.Empty;
        var emailInput = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var roleInput = request.Role?.Trim().ToLowerInvariant() ?? string.Empty;

        logger.LogInformation("Signup sequence started for: {Email}. Originally requested role: {Role}", emailInput, roleInput);

        if (string.IsNullOrWhiteSpace(name)) return SignupResultDto.Failure("Name is required.");
        if (string.IsNullOrWhiteSpace(emailInput)) return SignupResultDto.Failure("Email is required.");
        if (string.IsNullOrWhiteSpace(roleInput)) return SignupResultDto.Failure("Role is required.");

        // Check for existing user
        var existingUser = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == emailInput, cancellationToken);

        if (existingUser != null)
        {
            logger.LogWarning("Signup aborted: User already exists with email {Email}", emailInput);
            return SignupResultDto.Failure("An account with this email already exists.");
        }

        // --- NEW BUSINESS LOGIC: Force role from invitations if they exist ---
        string roleToUse = roleInput;
        
        // Find if this person was invited to any projects.
        // We use ToLower() on both sides for case-insensitive matching.
        var pendingInvitation = await context.ProjectMembers
            .AsNoTracking()
            .Where(pm => pm.UserId == null && pm.Email.ToLower() == emailInput)
            .OrderByDescending(pm => pm.Role) // Simple prioritization: project manager sorts higher alphabetically than developer/qa analyst
            .FirstOrDefaultAsync(cancellationToken);

        if (pendingInvitation != null)
        {
            var invitedRole = pendingInvitation.Role.ToLower().Trim();
            logger.LogInformation("Invitation found for {Email}! Overriding requested role '{Requested}' with invited role '{Invited}'.", 
                emailInput, roleInput, invitedRole);
            roleToUse = invitedRole;
        }
        else
        {
            logger.LogInformation("No pending invitations found for {Email}. Proceeding with user-selected role: {Role}", emailInput, roleInput);
        }

        // Step 1: Create user in Supabase Auth
        // This will create the user in auth.users, and a trigger will copy it to public.users
        var supabaseResult = await supabaseAuthService.SignUpAsync(
            emailInput, 
            request.Password, 
            displayName: name, 
            role: roleToUse, 
            cancellationToken);
        
        if (!supabaseResult.Success)
        {
            logger.LogError("Supabase signup failed for {Email}: {Error}", emailInput, supabaseResult.ErrorMessage);
            return SignupResultDto.Failure(supabaseResult.ErrorMessage ?? "Failed to create account.");
        }

        if (string.IsNullOrEmpty(supabaseResult.SupabaseUserId) || !Guid.TryParse(supabaseResult.SupabaseUserId, out var supabaseUserId))
        {
            logger.LogError("Supabase signup returned invalid UserID for {Email}: {UserId}", emailInput, supabaseResult.SupabaseUserId);
            return SignupResultDto.Failure("Failed to create account in authentication service.");
        }

        logger.LogInformation("Supabase signup successful. User ID: {UserId}", supabaseUserId);

        // Wait a small bit for DB trigger if needed (though we'll link project members manually anyway)
        await System.Threading.Tasks.Task.Delay(500, cancellationToken);
        
        // Step 2: Link project memberships
        var projectMemberships = await context.ProjectMembers
            .Where(pm => pm.UserId == null && pm.Email.ToLower() == emailInput)
            .ToListAsync(cancellationToken);
            
        if (projectMemberships.Any())
        {
            logger.LogInformation("Linking {Count} project memberships for {Email} to user ID {UserId}", projectMemberships.Count, emailInput, supabaseUserId);
            foreach (var pm in projectMemberships)
            {
                pm.UserId = supabaseUserId;
                pm.Status = "Active";
                pm.UpdatedAt = DateTimeOffset.UtcNow;
            }
            
            await context.SaveChangesAsync(cancellationToken);
        }

        // Return the role that was ACTUALLY assigned (potentially forced)
        return SignupResultDto.CreateSuccess(supabaseUserId, Guid.Empty, roleToUse);
    }

    public async Task<LoginResultDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var email = request.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email)) return LoginResultDto.Failure("Email is required.");

        var supabaseResult = await supabaseAuthService.SignInAsync(email, request.Password, cancellationToken);
        if (!supabaseResult.Success)
        {
            return LoginResultDto.Failure(supabaseResult.ErrorMessage ?? "Invalid email or password.");
        }

        var supabaseUserId = Guid.Parse(supabaseResult.SupabaseUserId);
        var user = await context.Users.FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, cancellationToken);

        if (user is null)
        {
            await System.Threading.Tasks.Task.Delay(500, cancellationToken);
            user = await context.Users.FirstOrDefaultAsync(u => u.SupabaseUserId == supabaseUserId, cancellationToken);
        }

        if (user is null)
        {
            return LoginResultDto.Failure("User account found in authentication service but not in database. Please contact support.");
        }

        // Map database role to UI permission set
        var dbRole = user.Role?.Trim().ToLower() ?? "developer";
        var uiRole = dbRole switch
        {
            "project manager" or "po" => "po",
            _ => "team"
        };

        return LoginResultDto.CreateSuccess(user.SupabaseUserId, user.Email ?? email, user.DisplayName, uiRole);
    }
}
