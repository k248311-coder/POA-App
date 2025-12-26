# Gemini API Setup

To use the project creation feature with SRS document processing, you need to configure the Gemini API.

## Steps:

1. **Get a Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the API key

2. **Configure the API Key:**
   
   **Option 1: User Secrets (Recommended for Development)**
   ```powershell
   cd D:\POA-App\POA-Backend\POA.WebApi
   dotnet user-secrets set "Gemini:ApiKey" "YOUR_API_KEY_HERE"
   ```

   **Option 2: appsettings.json**
   - Open `POA-Backend/POA.WebApi/appsettings.json`
   - Add your API key:
   ```json
   "Gemini": {
     "ApiKey": "YOUR_API_KEY_HERE",
     "ApiUrl": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"
   }
   ```

3. **Verify Configuration:**
   - Restart your backend
   - The service will validate the API key on startup

## Supported File Types:

- **Text files (.txt)**: Direct text extraction
- **PDF files (.pdf)**: Text extraction (basic support)
- **Word documents (.doc, .docx)**: Text extraction (basic support)

**Note:** For better PDF/DOC support, consider using a dedicated document parsing library like:
- `iTextSharp` for PDF
- `DocumentFormat.OpenXml` for DOCX
- Or use Gemini's file upload API (requires additional implementation)

## API Limits:

- Gemini API has rate limits and usage quotas
- Free tier: 15 requests per minute
- Check your quota at [Google Cloud Console](https://console.cloud.google.com/)

