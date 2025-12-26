# Database Updates Required

## Summary

**No new tables are needed!** All required tables already exist:
- ✅ `projects` table
- ✅ `epics` table  
- ✅ `features` table
- ✅ `stories` table

## Required Column Addition

You need to add **ONE new column** to the existing `stories` table:

### Add `test_cases` Column

Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS test_cases TEXT;
```

**File:** `POA-Backend/add_test_cases_column.sql` (already created for you)

## Existing Columns (Already Present)

The `stories` table already has:
- ✅ `acceptance_criteria` (TEXT) - stores acceptance criteria
- ✅ `story_points` (INTEGER) - stores story point estimates

## Verification

After adding the column, verify it exists:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'stories'
  AND column_name IN ('test_cases', 'acceptance_criteria', 'story_points');
```

You should see all three columns listed.

