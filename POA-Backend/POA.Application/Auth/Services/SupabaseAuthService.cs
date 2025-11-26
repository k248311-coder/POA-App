using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using POA.Application.Auth.Interfaces;

namespace POA.Application.Auth.Services;

public sealed class SupabaseAuthService : ISupabaseAuthService
{
    private readonly HttpClient _httpClient;
    private readonly string _supabaseUrl;
    private readonly string _supabaseAnonKey;

    public SupabaseAuthService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _supabaseUrl = configuration["Supabase:Url"]?.Trim() ?? throw new InvalidOperationException("Supabase:Url is not configured in appsettings.json. Please add it under 'Supabase:Url'.");
        _supabaseAnonKey = configuration["Supabase:AnonKey"]?.Trim() ?? throw new InvalidOperationException("Supabase:AnonKey is not configured in appsettings.json. Please add it under 'Supabase:AnonKey'.");
        
        if (string.IsNullOrWhiteSpace(_supabaseUrl))
        {
            throw new InvalidOperationException("Supabase:Url cannot be empty. Please configure it in appsettings.json.");
        }
        
        if (string.IsNullOrWhiteSpace(_supabaseAnonKey))
        {
            throw new InvalidOperationException("Supabase:AnonKey cannot be empty. Please configure it in appsettings.json.");
        }
        
        // Ensure URL doesn't have trailing slash
        var baseUrl = _supabaseUrl.TrimEnd('/');
        if (!baseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Supabase URL must start with https://. Current value: {baseUrl}");
        }
        
        _httpClient.BaseAddress = new Uri(baseUrl);
        
        // Set headers - these will be included in all requests
        // Note: Don't set Content-Type here - PostAsJsonAsync sets it automatically
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("apikey", _supabaseAnonKey);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_supabaseAnonKey}");
    }

    public async Task<SupabaseAuthResult> SignUpAsync(string email, string password, string? displayName = null, string? role = null, CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate and normalize email
            if (string.IsNullOrWhiteSpace(email))
            {
                return new SupabaseAuthResult(false, null, null, "Email cannot be empty.");
            }

            var normalizedEmail = email.Trim().ToLowerInvariant();
            
            // Debug: Log email to check for hidden characters
            Console.WriteLine($"[SupabaseAuth] SignUp - Email received: '{email}'");
            Console.WriteLine($"[SupabaseAuth] SignUp - Email normalized: '{normalizedEmail}'");
            Console.WriteLine($"[SupabaseAuth] SignUp - Email bytes: {BitConverter.ToString(System.Text.Encoding.UTF8.GetBytes(normalizedEmail))}");
            
            if (string.IsNullOrWhiteSpace(password))
            {
                return new SupabaseAuthResult(false, null, null, "Password cannot be empty.");
            }

            // Build the user_metadata object for Supabase Auth
            // Note: Supabase REST API uses "data" field, which maps to user_metadata
            var userMetadata = new Dictionary<string, object>();
            if (!string.IsNullOrWhiteSpace(displayName))
            {
                userMetadata["display_name"] = displayName;
            }
            if (!string.IsNullOrWhiteSpace(role))
            {
                userMetadata["role"] = role;
            }

            // Supabase Auth REST API format for signup
            var request = new Dictionary<string, object>
            {
                ["email"] = normalizedEmail,
                ["password"] = password
            };
            
            // Only include data if we have metadata
            if (userMetadata.Count > 0)
            {
                request["data"] = userMetadata;
            }

            // Debug: Log request details
            var fullUrl = $"{_supabaseUrl.TrimEnd('/')}/auth/v1/signup";
            Console.WriteLine($"[SupabaseAuth] SignUp - Request URL: {fullUrl}");
            Console.WriteLine($"[SupabaseAuth] SignUp - Request email: '{request["email"]}'");
            Console.WriteLine($"[SupabaseAuth] SignUp - Supabase URL: '{_supabaseUrl}'");
            Console.WriteLine($"[SupabaseAuth] SignUp - Anon Key (first 20 chars): '{_supabaseAnonKey?.Substring(0, Math.Min(20, _supabaseAnonKey?.Length ?? 0))}...'");
            
            // Check headers
            var hasApikey = _httpClient.DefaultRequestHeaders.Contains("apikey");
            var hasAuth = _httpClient.DefaultRequestHeaders.Contains("Authorization");
            Console.WriteLine($"[SupabaseAuth] SignUp - Has apikey header: {hasApikey}");
            Console.WriteLine($"[SupabaseAuth] SignUp - Has Authorization header: {hasAuth}");
            
            if (hasApikey)
            {
                var apikeyValues = _httpClient.DefaultRequestHeaders.GetValues("apikey");
                Console.WriteLine($"[SupabaseAuth] SignUp - apikey header value (first 20 chars): '{string.Join(", ", apikeyValues).Substring(0, Math.Min(20, string.Join(", ", apikeyValues).Length))}...'");
            }
            
            if (hasAuth)
            {
                var authValues = _httpClient.DefaultRequestHeaders.GetValues("Authorization");
                Console.WriteLine($"[SupabaseAuth] SignUp - Authorization header value (first 30 chars): '{string.Join(", ", authValues).Substring(0, Math.Min(30, string.Join(", ", authValues).Length))}...'");
            }

            // Serialize request to verify format
            var requestJson = System.Text.Json.JsonSerializer.Serialize(request);
            Console.WriteLine($"[SupabaseAuth] SignUp - Request body JSON: {requestJson}");
            
            // Verify email format one more time
            var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(normalizedEmail))
            {
                return new SupabaseAuthResult(false, null, null, $"Invalid email format: {normalizedEmail}");
            }
            
            // Use PostAsJsonAsync - it handles Content-Type automatically
            // The DefaultRequestHeaders (apikey and Authorization) should be included automatically
            Console.WriteLine($"[SupabaseAuth] SignUp - Full URL: {fullUrl}");
            Console.WriteLine($"[SupabaseAuth] SignUp - Email validation passed: {normalizedEmail}");
            
            var response = await _httpClient.PostAsJsonAsync("/auth/v1/signup", request, cancellationToken);
            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            
            // Debug: Log response
            Console.WriteLine($"[SupabaseAuth] SignUp - Response status: {response.StatusCode}");
            Console.WriteLine($"[SupabaseAuth] SignUp - Response content: {content}");

            if (!response.IsSuccessStatusCode)
            {
                var error = JsonSerializer.Deserialize<JsonElement>(content);
                
                // Try multiple error message fields that Supabase might return
                string? errorMessage = null;
                if (error.TryGetProperty("error_description", out var desc))
                {
                    errorMessage = desc.GetString();
                }
                else if (error.TryGetProperty("msg", out var msg))
                {
                    errorMessage = msg.GetString();
                }
                else if (error.TryGetProperty("message", out var message))
                {
                    errorMessage = message.GetString();
                }
                else if (error.TryGetProperty("error", out var errorProp))
                {
                    errorMessage = errorProp.GetString();
                }
                
                // If we still don't have an error message, include the full response for debugging
                if (string.IsNullOrWhiteSpace(errorMessage))
                {
                    errorMessage = $"Failed to create account. Response: {content}";
                }
                
                return new SupabaseAuthResult(false, null, null, errorMessage);
            }

            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            // Try to extract user ID from different possible response formats
            string? userId = null;
            if (result.TryGetProperty("user", out var user))
            {
                if (user.TryGetProperty("id", out var id))
                {
                    userId = id.GetString();
                }
            }
            // Sometimes the user ID might be at the root level
            else if (result.TryGetProperty("id", out var rootId))
            {
                userId = rootId.GetString();
            }
            
            var accessToken = result.TryGetProperty("access_token", out var token)
                ? token.GetString()
                : null;

            // If we still don't have a user ID, include the response content in the error
            if (string.IsNullOrEmpty(userId))
            {
                return new SupabaseAuthResult(
                    false, 
                    null, 
                    null, 
                    $"Failed to extract user ID from Supabase response. Response: {content}");
            }

            // Check if email confirmation is required
            // When email confirmation is enabled, Supabase creates the user but they need to confirm
            bool requiresConfirmation = false;
            if (result.TryGetProperty("user", out var userObj))
            {
                // Check if confirmed_at is null (user not confirmed yet)
                if (userObj.TryGetProperty("confirmed_at", out var confirmedAt))
                {
                    requiresConfirmation = confirmedAt.ValueKind == JsonValueKind.Null;
                }
                // Also check if confirmation was sent
                if (userObj.TryGetProperty("confirmation_sent_at", out var sentAt) && sentAt.ValueKind != JsonValueKind.Null)
                {
                    requiresConfirmation = true;
                }
            }

            // Note: Even if email confirmation is required, the user IS created in auth.users
            // They just can't sign in until confirmed. So we should still return success.
            // However, if the user doesn't exist at all, that's a problem.
            
            return new SupabaseAuthResult(true, userId, accessToken, requiresConfirmation ? "Email confirmation required. Please check your email." : null);
        }
        catch (Exception ex)
        {
            return new SupabaseAuthResult(false, null, null, ex.Message);
        }
    }

    public async Task<SupabaseAuthResult> SignInAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new
            {
                email = email.ToLowerInvariant(),
                password = password
            };

            var response = await _httpClient.PostAsJsonAsync("/auth/v1/token?grant_type=password", request, cancellationToken);
            var content = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = JsonSerializer.Deserialize<JsonElement>(content);
                var errorMessage = error.TryGetProperty("error_description", out var desc) 
                    ? desc.GetString() 
                    : error.TryGetProperty("msg", out var msg) 
                        ? msg.GetString() 
                        : "Invalid email or password.";
                
                return new SupabaseAuthResult(false, null, null, errorMessage);
            }

            var result = JsonSerializer.Deserialize<JsonElement>(content);
            
            // Try to extract user ID from different possible response formats
            string? userId = null;
            if (result.TryGetProperty("user", out var user))
            {
                if (user.TryGetProperty("id", out var id))
                {
                    userId = id.GetString();
                }
            }
            // Sometimes the user ID might be at the root level
            else if (result.TryGetProperty("id", out var rootId))
            {
                userId = rootId.GetString();
            }
            
            var accessToken = result.TryGetProperty("access_token", out var token)
                ? token.GetString()
                : null;

            // If we still don't have a user ID, include the response content in the error
            if (string.IsNullOrEmpty(userId))
            {
                return new SupabaseAuthResult(
                    false, 
                    null, 
                    null, 
                    $"Failed to extract user ID from Supabase response. Response: {content}");
            }

            return new SupabaseAuthResult(true, userId, accessToken, null);
        }
        catch (Exception ex)
        {
            return new SupabaseAuthResult(false, null, null, ex.Message);
        }
    }
}

