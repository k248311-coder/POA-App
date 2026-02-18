# API Keys & Secrets

The POA backend does **not** commit any API keys or connection strings. Use a **secrets file** (recommended) or User Secrets. The secrets file is in **.gitignore** — you copy it manually only to trusted environments.

---

## Option 1: Secrets file (recommended for teams)

The app reads keys from **`POA.WebApi/secrets.json`** when the file exists. This file is **gitignored** and must be copied manually to each trusted machine (dev PC, build server, production server).

### Setup on a new machine

1. In **`POA-Backend/POA.WebApi`**, create `secrets.json` using the structure in **`secrets.json.example`**.
2. Fill in real values (get them from your team — see “Sharing values” below).
3. Do **not** commit `secrets.json`. It is listed in `.gitignore`.

Example `secrets.json` (same structure as `secrets.json.example`):

```json
{
  "ConnectionStrings": {
    "Database": "Host=...;Port=5432;Database=postgres;Username=...;Password=...;Ssl Mode=Require;Trust Server Certificate=true;Pooling=true"
  },
  "Supabase": {
    "Url": "https://YOUR_PROJECT.supabase.co",
    "AnonKey": "YOUR_SUPABASE_ANON_KEY"
  },
  "Gemini": {
    "ApiKey": "YOUR_GEMINI_API_KEY",
    "ApiUrl": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
  }
}
```

### Sharing the file within the team

- **Preferred:** Keep one master `secrets.json` (or a copy) in a **password manager** or **private team doc**. Teammates download/copy it and place it in `POA-Backend/POA.WebApi/secrets.json` on their machine or on trusted servers.
- **Or:** One person (e.g. tech lead) sends the file once per teammate over a secure channel (encrypted drive, secure link). The teammate puts it only in `POA.WebApi/` on trusted environments.
- **Never:** Commit `secrets.json` to Git, or send it in plain email/Slack.

### Required keys

| Key | Description | Where to get it |
|-----|-------------|-----------------|
| `ConnectionStrings:Database` | PostgreSQL connection string | Supabase Dashboard → Project Settings → Database |
| `Supabase:Url` | Supabase project URL | Supabase Dashboard → Project Settings → API |
| `Supabase:AnonKey` | Supabase anonymous API key | Supabase Dashboard → Project Settings → API |
| `Gemini:ApiKey` | Google Gemini API key | [Google AI Studio](https://aistudio.google.com/apikey) |
| `Gemini:ApiUrl` | (Optional) Gemini endpoint | Only if you need a different URL |

---

## Option 2: User Secrets (alternative)

If you prefer not to use a file, use .NET User Secrets (values stay outside the repo):

```powershell
cd POA-Backend/POA.WebApi

dotnet user-secrets set "ConnectionStrings:Database" "YOUR_CONNECTION_STRING"
dotnet user-secrets set "Supabase:Url" "https://YOUR_PROJECT.supabase.co"
dotnet user-secrets set "Supabase:AnonKey" "YOUR_ANON_KEY"
dotnet user-secrets set "Gemini:ApiKey" "YOUR_GEMINI_API_KEY"
```

If **both** `secrets.json` and User Secrets are set, User Secrets override (they are loaded after the secrets file).

---

## Checklist for a new developer

1. Clone the repo.
2. Get **`secrets.json`** from your team (password manager or secure doc) **or** copy `secrets.json.example` to `secrets.json` and fill in values from your team.
3. Place `secrets.json` in **`POA-Backend/POA.WebApi/`**. Confirm it is **not** tracked by Git (`git status` should not list it).
4. Run the API; it will load secrets from `secrets.json` (and User Secrets if set).

---

## Production

On production servers, either:

- Place `secrets.json` on the server (only via a secure process, e.g. from a secrets manager or secure copy), or  
- Use **environment variables** or a **secrets manager** (e.g. Azure Key Vault, AWS Secrets Manager).  

Same key names apply; the app reads from configuration regardless of source.
