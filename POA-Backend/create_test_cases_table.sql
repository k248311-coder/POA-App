-- Create test_cases table to store multiple test cases per story
-- Run this in your Supabase SQL Editor

-- Create the test_cases table
CREATE TABLE IF NOT EXISTS public.test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    test_case TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_test_cases_story_id ON public.test_cases(story_id);

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'test_cases'
ORDER BY ordinal_position;

