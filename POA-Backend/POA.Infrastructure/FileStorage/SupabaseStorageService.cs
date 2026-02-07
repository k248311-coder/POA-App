using System.Net.Http.Headers;
using Microsoft.Extensions.Configuration;
using POA.Application.Projects.Interfaces;

namespace POA.Infrastructure.FileStorage;

/// <summary>
/// Stateless file storage using Supabase Storage (cloud object storage).
/// Replaces local disk storage so the API can run without local upload directories.
/// </summary>
public sealed class SupabaseStorageService : IFileStorageService
{
    private const string StorageApiPath = "storage/v1";
    private const string Prefix = "supabase:";

    private readonly HttpClient _httpClient;
    private readonly string _supabaseUrl;
    private readonly string _bucketName;

    public SupabaseStorageService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClient = httpClientFactory.CreateClient();
        _supabaseUrl = (configuration["Supabase:Url"] ?? "").Trim().TrimEnd('/');
        _bucketName = (configuration["Supabase:Storage:BucketName"] ?? "srs_pdf").Trim();

        if (string.IsNullOrWhiteSpace(_supabaseUrl))
            throw new InvalidOperationException("Supabase:Url is not configured. Add it under 'Supabase:Url' in appsettings or secrets.");
        if (string.IsNullOrWhiteSpace(_bucketName))
            throw new InvalidOperationException("Supabase:Storage:BucketName cannot be empty.");

        // Use Service Role key for Storage to bypass RLS (server-side only; never expose to frontend).
        // If not set, fall back to Anon key (requires Storage RLS policies to allow upload/read/delete).
        var serviceRoleKey = (configuration["Supabase:ServiceRoleKey"] ?? "").Trim();
        var anonKey = (configuration["Supabase:AnonKey"] ?? "").Trim();
        var storageKey = !string.IsNullOrWhiteSpace(serviceRoleKey) ? serviceRoleKey : anonKey;
        if (string.IsNullOrWhiteSpace(storageKey))
            throw new InvalidOperationException(
                "Supabase Storage requires either Supabase:ServiceRoleKey (recommended) or Supabase:AnonKey. " +
                "Service Role bypasses RLS; see SUPABASE_STORAGE.md.");

        _httpClient.BaseAddress = new Uri(_supabaseUrl + "/");
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("apikey", storageKey);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", storageKey);
    }

    /// <inheritdoc />
    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(fileName);
        var objectKey = $"{Guid.NewGuid():N}{ext}";
        var uploadUrl = $"{StorageApiPath}/object/{_bucketName}/{objectKey}";
        var contentType = GetContentType(ext);

        using var content = new StreamContent(fileStream);
        content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        using var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl) { Content = content };
        request.Headers.Add("x-upsert", "true");

        var response = await _httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            throw new InvalidOperationException(
                $"Supabase Storage upload failed ({response.StatusCode}): {body}");
        }

        // Return a stored path that encodes bucket + key so GetFileAsync can resolve it
        return Prefix + _bucketName + "/" + objectKey;
    }

    /// <inheritdoc />
    public async Task<Stream> GetFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        (string bucket, string objectKey) = ResolvePath(filePath);
        var downloadUrl = $"{StorageApiPath}/object/authenticated/{bucket}/{objectKey}";

        var response = await _httpClient.GetAsync(downloadUrl, cancellationToken).ConfigureAwait(false);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            throw new FileNotFoundException(
                $"Supabase Storage object not found or not accessible: {filePath}. Response: {body}");
        }

        return await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        (string bucket, string objectKey) = ResolvePath(filePath);
        var deleteUrl = $"{StorageApiPath}/object/{bucket}/{objectKey}";

        var response = await _httpClient.DeleteAsync(deleteUrl, cancellationToken).ConfigureAwait(false);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
            throw new InvalidOperationException(
                $"Supabase Storage delete failed ({response.StatusCode}): {body}");
        }
    }

    private static string GetContentType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".txt" => "text/plain",
            _ => "application/octet-stream"
        };
    }

    /// <summary>
    /// Resolves the stored path (supabase:bucket/key or legacy bucket/key) to bucket and object key.
    /// </summary>
    private (string bucket, string objectKey) ResolvePath(string filePath)
    {
        if (string.IsNullOrWhiteSpace(filePath))
            throw new ArgumentException("File path cannot be empty.", nameof(filePath));

        string path = filePath.Trim();
        if (path.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
            path = path.Substring(Prefix.Length);

        var slash = path.IndexOf('/');
        if (slash <= 0 || slash == path.Length - 1)
            throw new ArgumentException($"Invalid Supabase storage path: {filePath}", nameof(filePath));

        var bucket = path.Substring(0, slash);
        var objectKey = path.Substring(slash + 1);
        return (bucket, objectKey);
    }
}
