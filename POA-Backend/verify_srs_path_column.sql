-- Verify that the projects table has the srs_path column
-- Run this in your Supabase SQL editor to check

-- Check if srs_path column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
  AND column_name = 'srs_path';

-- If the column doesn't exist, run this to add it:
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS srs_path TEXT;

