# Supabase Storage (SRS file storage)

SRS documents are **temporarily** uploaded to **Supabase Storage** when creating a project: the file is sent to Gemini for processing, then **deleted** from Supabase. Nothing is kept in storage after the request. This keeps the API stateless and avoids retaining user documents.

## Configuration

Use the same Supabase project as Auth/Database. In `appsettings.json` or `secrets.json`:

```json
"Supabase": {
  "Url": "https://YOUR_PROJECT.supabase.co",
  "AnonKey": "YOUR_ANON_KEY",
  "ServiceRoleKey": "YOUR_SERVICE_ROLE_KEY",
  "Storage": {
    "BucketName": "srs_pdf"
  }
}
```

- **ServiceRoleKey** (recommended for Storage): Use this for Storage so uploads/reads/deletes **bypass Row Level Security (RLS)**. Get it in Supabase Dashboard → Project Settings → API → `service_role` (secret). **Never expose this key to the frontend.**
- **AnonKey**: Still required for Auth. If you don’t set `ServiceRoleKey`, the backend falls back to the anon key for Storage, which will fail with **403 "new row violates row-level security policy"** unless you add Storage RLS policies (see below).
- **BucketName** (optional): Storage bucket for SRS files. Default is `srs_pdf`.

## Create the bucket

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Storage**.
2. Click **New bucket**.
3. Name: `srs_pdf` (or the value you set in `Supabase:Storage:BucketName`).
4. Leave **Public bucket** **off**.
5. Create the bucket.

## Fixing 403 "row-level security policy" on upload

Supabase Storage uses RLS. The **anon** key is subject to RLS, so uploads often fail with `403 Unauthorized: new row violates row-level security policy`.

**Option A (recommended):** Set **Supabase:ServiceRoleKey** in your backend config (e.g. `secrets.json`). The service role key bypasses RLS, so the backend can upload, read, and delete in the bucket. Keep this key server-side only.

**Option B:** Keep using only the anon key and add Storage policies in Supabase. In Dashboard → Storage → Policies (or SQL Editor), add policies for bucket `srs_pdf` so that the `anon` role is allowed to INSERT, SELECT, and DELETE on `storage.objects` for that bucket. This is more work and can be less secure if the anon key is ever exposed.

## SRS upload workflow

1. User uploads SRS doc (PDF/DOC/DOCX/TXT) when creating a project.
2. Backend uploads it to Supabase Storage (bucket `srs_pdf`).
3. Backend downloads that file from Supabase and sends the stream to Gemini.
4. After Gemini returns the hierarchy, the backend **deletes** the file from Supabase.
5. Project is created with the Gemini-generated backlog; **no SRS path is persisted** (the file is gone).

Path format used internally during the request: `supabase:srs_pdf/<guid>.<ext>`. It is not saved to the database.

## File storage

The backend uses **Supabase Storage only**. There is no local file storage. All SRS uploads go to the `srs_pdf` bucket and are deleted after Gemini processing.
