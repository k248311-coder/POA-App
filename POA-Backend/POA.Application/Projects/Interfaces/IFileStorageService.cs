using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace POA.Application.Projects.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);
    Task<Stream> GetFileAsync(string filePath, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);
}

