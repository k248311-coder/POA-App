using POA.Application.Projects.Interfaces;

namespace POA.Infrastructure.FileStorage;

public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly string _storagePath;
    private const string StorageFolder = "uploads";

    public LocalFileStorageService()
    {
        // Store files in a local uploads folder
        var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
        _storagePath = Path.Combine(baseDirectory, StorageFolder);
        
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        // Generate a unique file name to avoid conflicts
        var fileExtension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(_storagePath, uniqueFileName);

        using (var fileStreamWriter = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamWriter, cancellationToken);
        }

        // Return relative path for storage in database
        return Path.Combine(StorageFolder, uniqueFileName);
    }

    public Task<Stream> GetFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.IsPathRooted(filePath) 
            ? filePath 
            : Path.Combine(AppDomain.CurrentDomain.BaseDirectory, filePath);

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"File not found: {filePath}");
        }

        var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        return Task.FromResult<Stream>(fileStream);
    }

    public Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.IsPathRooted(filePath)
            ? filePath
            : Path.Combine(AppDomain.CurrentDomain.BaseDirectory, filePath);

        if (File.Exists(fullPath))
        {
            try
            {
                File.Delete(fullPath);
            }
            catch (IOException)
            {
                // Ignore if file is in use or already deleted
            }
        }

        return Task.CompletedTask;
    }
}

