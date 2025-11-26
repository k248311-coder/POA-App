# Supabase Configuration Guide

## 1. Verify Supabase URL Format

Your Supabase URL should be in this format:
```
https://<project-ref>.supabase.co
```

Example:
```
https://hupzvopjajggdnedsofk.supabase.co
```

**Important:** 
- Must start with `https://`
- Must NOT have a trailing slash
- Must be your project's Supabase URL (not a custom domain)

## 2. Verify Anon Key

1. Go to Supabase Dashboard → Project Settings → API
2. Copy the **anon/public** key (NOT the service_role key)
3. It should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Set in User Secrets

Run these commands in PowerShell from the `POA.WebApi` directory:

```powershell
cd D:\POA-App\POA-Backend\POA.WebApi

# Set Supabase URL (replace with your actual URL)
dotnet user-secrets set "Supabase:Url" "https://hupzvopjajggdnedsofk.supabase.co"

# Set Supabase Anon Key (replace with your actual key)
dotnet user-secrets set "Supabase:AnonKey" "your-anon-key-here"
```

## 4. Verify Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → Settings
2. Check these settings:

   **Email Auth:**
   - ✅ Enable Email provider (should be enabled)
   - ✅ Confirm email (you can disable this for testing, or keep enabled)

   **Email Templates:**
   - Make sure email templates are configured (even if you disable confirmation)

   **Site URL:**
   - Should be set to your frontend URL (e.g., `http://localhost:3000`)

## 5. Test the Configuration

After setting up, restart your backend and try signup again. Check the console logs for:
- The exact URL being called
- Whether headers are present
- The request body format
- The response from Supabase

## 6. Common Issues

### Issue: "Email address is invalid"
**Causes:**
- Missing or incorrect `apikey` header
- Missing or incorrect `Authorization` header
- Wrong Supabase URL format
- Email already exists in Supabase

**Solution:**
- Verify user secrets are set correctly
- Check console logs for header values
- Try a different email address
- Check Supabase Dashboard → Authentication → Users to see if email exists

### Issue: Headers not being sent
**Solution:**
- The code now explicitly sets headers on each request
- Check console logs to verify headers are present

### Issue: Wrong URL format
**Solution:**
- URL must be: `https://<project-ref>.supabase.co`
- No trailing slash
- Must use HTTPS

## 7. Verify Request Format

The request should be:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "data": {
    "display_name": "User Name",
    "role": "po"
  }
}
```

And the headers should be:
```
apikey: <your-anon-key>
Authorization: Bearer <your-anon-key>
Content-Type: application/json
```

