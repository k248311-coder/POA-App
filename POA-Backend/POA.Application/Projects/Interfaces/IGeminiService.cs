using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace POA.Application.Projects.Interfaces;

public interface IGeminiService
{
    Task<string> ProcessSrsDocumentAsync(Stream documentStream, string fileName, CancellationToken cancellationToken = default);
}

