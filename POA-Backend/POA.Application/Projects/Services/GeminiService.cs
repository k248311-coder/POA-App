using System.IO;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using POA.Application.Projects.Dtos;
using POA.Application.Projects.Interfaces;

namespace POA.Application.Projects.Services;

public sealed class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini:ApiKey is not configured.");
        // Using Gemini 2.0 Flash (experimental) - update to gemini-2.5-flash-lite when available
        _apiUrl = configuration["Gemini:ApiUrl"] ?? "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new InvalidOperationException("Gemini:ApiKey cannot be empty.");
        }
    }

    public async Task<string> ProcessSrsDocumentAsync(Stream documentStream, string fileName, CancellationToken cancellationToken = default)
    {
        var fileExtension = Path.GetExtension(fileName).ToLowerInvariant();
        Console.WriteLine($"[GeminiService] Processing file: {fileName}, Extension: {fileExtension}");
        
        string documentContent;
        
        // Handle different file types
        if (fileExtension == ".pdf")
        {
            // For PDF files, we need to use Gemini's file upload API or convert to base64
            // For now, let's try to extract text (basic approach - may not work for all PDFs)
            // TODO: Consider using a PDF library like iTextSharp or PdfPig for better extraction
            Console.WriteLine($"[GeminiService] PDF file detected. Converting to base64 for Gemini API...");
            
            // Read PDF as bytes and convert to base64
            using (var memoryStream = new MemoryStream())
            {
                await documentStream.CopyToAsync(memoryStream, cancellationToken);
                var pdfBytes = memoryStream.ToArray();
                var base64Pdf = Convert.ToBase64String(pdfBytes);
                
                // Use Gemini's file upload API with inline data
                return await ProcessFileWithGeminiAsync(base64Pdf, fileName, "application/pdf", cancellationToken);
            }
        }
        else if (fileExtension == ".docx" || fileExtension == ".doc")
        {
            // For Word documents, we also need special handling
            Console.WriteLine($"[GeminiService] Word document detected. Converting to base64...");
            
            using (var memoryStream = new MemoryStream())
            {
                await documentStream.CopyToAsync(memoryStream, cancellationToken);
                var docBytes = memoryStream.ToArray();
                var base64Doc = Convert.ToBase64String(docBytes);
                
                var mimeType = fileExtension == ".docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/msword";
                return await ProcessFileWithGeminiAsync(base64Doc, fileName, mimeType, cancellationToken);
            }
        }
        else
        {
            // For text files, read as text
            Console.WriteLine($"[GeminiService] Text file detected. Reading as text...");
            using (var reader = new StreamReader(documentStream, Encoding.UTF8))
            {
                documentContent = await reader.ReadToEndAsync(cancellationToken);
            }
            
            return await ProcessTextWithGeminiAsync(documentContent, cancellationToken);
        }
    }
    
    private async Task<string> ProcessFileWithGeminiAsync(string base64Content, string fileName, string mimeType, CancellationToken cancellationToken)
    {
        // Create the prompt for Gemini
        var prompt = @"You are a software requirements analyst. Analyze the attached Software Requirements Specification (SRS) document and transform it into a structured JSON hierarchy.

The output must be a valid JSON object with the following structure:
{
  ""project"": ""<Project Name>"",
  ""version"": ""1.0"",
  ""epics"": [
    {
      ""name"": ""<Epic Name>"",
      ""description"": ""<Epic Description>"",
      ""features"": [
        {
          ""name"": ""<Feature Name>"",
          ""stories"": [
            {
              ""title"": ""<Story Title>"",
              ""story_points"": <Story Point Estimate (integer, e.g., 1, 2, 3, 5, 8, 13)>,
              ""estimated_dev_hours"": <Estimated Development Hours (decimal, e.g., 8.5)>,
              ""estimated_test_hours"": <Estimated QA/Testing Hours (decimal, e.g., 4.0)>,
              ""acceptance_criteria"": [
                ""<Criterion 1>"",
                ""<Criterion 2>""
              ],
              ""test_cases"": [
                ""<Test Case 1>"",
                ""<Test Case 2>""
              ]
            }
          ]
        }
      ]
    }
  ]
}

Rules:
1. Extract all major epics from the SRS document
2. For each epic, identify the features (large work items)
3. For each feature, break down into user stories
4. For each story:
   - Estimate story points using Fibonacci sequence (1, 2, 3, 5, 8, 13) based on complexity and effort
   - Estimate development hours (decimal number, e.g., 8.5 hours for development work)
   - Estimate QA/testing hours (decimal number, e.g., 4.0 hours for testing and validation)
   - Extract acceptance criteria (what must be true for the story to be considered complete)
   - Generate test cases (how to verify the story works correctly)
5. Ensure all JSON is valid and properly formatted
6. Return ONLY the JSON object, no additional text or markdown";

        // Prepare the request with file data
        // Use Dictionary to avoid type inference issues with mixed anonymous types
        var requestBody = new Dictionary<string, object>
        {
            ["contents"] = new[]
            {
                new Dictionary<string, object>
                {
                    ["parts"] = new object[]
                    {
                        new Dictionary<string, object> { ["text"] = prompt },
                        new Dictionary<string, object>
                        {
                            ["inline_data"] = new Dictionary<string, object>
                            {
                                ["mime_type"] = mimeType,
                                ["data"] = base64Content
                            }
                        }
                    }
                }
            }
        };

        return await CallGeminiApiAsync(requestBody, cancellationToken);
    }
    
    private async Task<string> ProcessTextWithGeminiAsync(string documentContent, CancellationToken cancellationToken)
    {
        // Create the prompt for Gemini
        var prompt = $@"You are a software requirements analyst. Analyze the following Software Requirements Specification (SRS) document and transform it into a structured JSON hierarchy.

The output must be a valid JSON object with the following structure:
{{
  ""project"": ""<Project Name>"",
  ""version"": ""1.0"",
  ""epics"": [
    {{
      ""name"": ""<Epic Name>"",
      ""description"": ""<Epic Description>"",
      ""features"": [
        {{
          ""name"": ""<Feature Name>"",
          ""stories"": [
            {{
              ""title"": ""<Story Title>"",
              ""story_points"": <Story Point Estimate (integer, e.g., 1, 2, 3, 5, 8, 13)>,
              ""estimated_dev_hours"": <Estimated Development Hours (decimal, e.g., 8.5)>,
              ""estimated_test_hours"": <Estimated QA/Testing Hours (decimal, e.g., 4.0)>,
              ""acceptance_criteria"": [
                ""<Criterion 1>"",
                ""<Criterion 2>""
              ],
              ""test_cases"": [
                ""<Test Case 1>"",
                ""<Test Case 2>""
              ]
            }}
          ]
        }}
      ]
    }}
  ]
}}

Rules:
1. Extract all major epics from the SRS document
2. For each epic, identify the features (large work items)
3. For each feature, break down into user stories
4. For each story:
   - Estimate story points using Fibonacci sequence (1, 2, 3, 5, 8, 13) based on complexity and effort
   - Estimate development hours (decimal number, e.g., 8.5 hours for development work)
   - Estimate QA/testing hours (decimal number, e.g., 4.0 hours for testing and validation)
   - Extract acceptance criteria (what must be true for the story to be considered complete)
   - Generate test cases (how to verify the story works correctly)
5. Ensure all JSON is valid and properly formatted
6. Return ONLY the JSON object, no additional text or markdown

SRS Document:
{documentContent}";

        // Prepare the request to Gemini API
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = prompt
                        }
                    }
                }
            }
        };

        return await CallGeminiApiAsync(requestBody, cancellationToken);
    }
    
    private async Task<string> CallGeminiApiAsync(object requestBody, CancellationToken cancellationToken)
    {
        Console.WriteLine($"[GeminiService] ====== STARTING GEMINI API CALL ======");
        Console.WriteLine($"[GeminiService] API URL: {_apiUrl}");
        Console.WriteLine($"[GeminiService] API Key configured: {!string.IsNullOrEmpty(_apiKey)}");
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Make the API call with retry logic for DNS issues
        var url = $"{_apiUrl}?key={_apiKey}";
        Console.WriteLine($"[GeminiService] Request URL: {url}");
        Console.WriteLine($"[GeminiService] Request body length: {json.Length} characters");
        Console.WriteLine($"[GeminiService] Sending request to Gemini API...");
        
        // Retry logic for DNS resolution failures and rate limiting
        const int maxRetries = 5;
        Exception? lastException = null;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                Console.WriteLine($"[GeminiService] Attempt {attempt} of {maxRetries}...");
                var response = await _httpClient.PostAsync(url, content, cancellationToken);
                
                // Check for rate limiting (429) or quota exceeded
                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                    Console.WriteLine($"[GeminiService] Rate limit/quota exceeded (429). Response: {errorContent}");
                    
                    // Try to extract retry delay from response
                    int retryDelaySeconds = ExtractRetryDelay(errorContent, attempt);
                    
                    if (attempt < maxRetries)
                    {
                        Console.WriteLine($"[GeminiService] Waiting {retryDelaySeconds} seconds before retry...");
                        await System.Threading.Tasks.Task.Delay(retryDelaySeconds * 1000, cancellationToken);
                        continue;
                    }
                    else
                    {
                        throw new HttpRequestException($"Gemini API quota/rate limit exceeded. Please check your API quota at https://ai.dev/usage?tab=rate-limit. Error: {errorContent}");
                    }
                }
                
                lastException = null; // Success, clear any previous exception
                return await ProcessGeminiResponseAsync(response, cancellationToken);
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("No such host is known") && attempt < maxRetries)
            {
                lastException = ex;
                Console.WriteLine($"[GeminiService] DNS resolution failed on attempt {attempt}. Retrying in 2 seconds...");
                await System.Threading.Tasks.Task.Delay(2000, cancellationToken);
            }
            catch (System.Net.Sockets.SocketException ex) when (ex.Message.Contains("No such host is known") && attempt < maxRetries)
            {
                lastException = ex;
                Console.WriteLine($"[GeminiService] DNS resolution failed on attempt {attempt}. Retrying in 2 seconds...");
                await System.Threading.Tasks.Task.Delay(2000, cancellationToken);
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("429") || ex.Message.Contains("TooManyRequests") || ex.Message.Contains("RESOURCE_EXHAUSTED") || ex.Message.Contains("quota"))
            {
                lastException = ex;
                int retryDelaySeconds = (int)Math.Pow(2, attempt); // Exponential backoff: 2, 4, 8, 16, 32 seconds
                if (attempt < maxRetries)
                {
                    Console.WriteLine($"[GeminiService] Quota/rate limit error on attempt {attempt}. Retrying in {retryDelaySeconds} seconds...");
                    await System.Threading.Tasks.Task.Delay(retryDelaySeconds * 1000, cancellationToken);
                }
            }
        }
        
        // If we get here, all retries failed
        if (lastException != null)
        {
            if (lastException.Message.Contains("429") || lastException.Message.Contains("quota") || lastException.Message.Contains("RESOURCE_EXHAUSTED"))
            {
                throw new HttpRequestException($"Gemini API quota/rate limit exceeded after {maxRetries} attempts. Please check your API quota and billing at https://ai.dev/usage?tab=rate-limit. You may need to upgrade your plan or wait for quota reset.", lastException);
            }
            throw new HttpRequestException($"Failed to connect to Gemini API after {maxRetries} attempts. Error: {lastException.Message}", lastException);
        }
        
        throw new InvalidOperationException("Unexpected error in Gemini API call");
    }
    
    private async Task<string> ProcessGeminiResponseAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        Console.WriteLine($"[GeminiService] Response status: {response.StatusCode}");
        Console.WriteLine($"[GeminiService] Response length: {responseContent.Length} characters");

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"[GeminiService] ERROR Response status: {response.StatusCode}");
            Console.WriteLine($"[GeminiService] ERROR Response content: {responseContent}");
            
            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                throw new HttpRequestException($"Gemini API quota/rate limit exceeded (429). Please check your quota at https://ai.dev/usage?tab=rate-limit. You may need to upgrade your plan or wait for quota reset. Details: {responseContent}");
            }
            
            throw new HttpRequestException($"Gemini API error: {response.StatusCode} - {responseContent}");
        }

        var geminiResponse = JsonSerializer.Deserialize<GeminiApiResponse>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (geminiResponse?.Candidates == null || geminiResponse.Candidates.Count == 0)
        {
            Console.WriteLine($"[GeminiService] ERROR: No candidates in response. Full response: {responseContent}");
            throw new InvalidOperationException("Gemini API returned no candidates.");
        }

        var generatedText = geminiResponse.Candidates[0].Content?.Parts?[0]?.Text;
        if (string.IsNullOrWhiteSpace(generatedText))
        {
            Console.WriteLine($"[GeminiService] ERROR: Empty text in response. Full response: {responseContent}");
            throw new InvalidOperationException("Gemini API returned empty response.");
        }

        Console.WriteLine($"[GeminiService] Successfully received response. Text length: {generatedText.Length} characters");
        Console.WriteLine($"[GeminiService] First 200 chars of response: {generatedText.Substring(0, Math.Min(200, generatedText.Length))}...");

        // Extract JSON from the response (in case it's wrapped in markdown)
        var jsonText = ExtractJsonFromResponse(generatedText);
        Console.WriteLine($"[GeminiService] Extracted JSON length: {jsonText.Length} characters");
        Console.WriteLine($"[GeminiService] ====== GEMINI API CALL COMPLETED SUCCESSFULLY ======");

        return jsonText;
    }

    private static string ExtractJsonFromResponse(string response)
    {
        // Try to find JSON object in the response
        var startIndex = response.IndexOf('{');
        var lastIndex = response.LastIndexOf('}');

        if (startIndex >= 0 && lastIndex >= startIndex)
        {
            return response.Substring(startIndex, lastIndex - startIndex + 1);
        }

        return response;
    }
    
    private static int ExtractRetryDelay(string errorContent, int attempt)
    {
        // Try to extract retry delay from error message (e.g., "retry delay: 4s")
        try
        {
            var retryMatch = System.Text.RegularExpressions.Regex.Match(errorContent, @"retry.*?(\d+)s", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (retryMatch.Success && int.TryParse(retryMatch.Groups[1].Value, out int delay))
            {
                return Math.Max(delay, 4); // Minimum 4 seconds
            }
        }
        catch
        {
            // Ignore regex errors
        }
        
        // Exponential backoff: 4, 8, 16, 32, 64 seconds
        return (int)Math.Pow(2, attempt + 1);
    }

    private sealed class GeminiApiResponse
    {
        public List<GeminiCandidate>? Candidates { get; set; }
    }

    private sealed class GeminiCandidate
    {
        public GeminiContent? Content { get; set; }
    }

    private sealed class GeminiContent
    {
        public List<GeminiPart>? Parts { get; set; }
    }

    private sealed class GeminiPart
    {
        public string? Text { get; set; }
    }
}

