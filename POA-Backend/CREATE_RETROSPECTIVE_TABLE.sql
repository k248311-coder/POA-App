-- SQL for creating sprint_retrospectives table
CREATE TABLE IF NOT EXISTS public.sprint_retrospectives (
    id UUID PRIMARY KEY,
    sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
    what_went_well TEXT,
    what_didnt_go_well TEXT,
    ideas_going_forward TEXT,
    action_items TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
