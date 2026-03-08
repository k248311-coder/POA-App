-- Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    user_id uuid,
    email text NOT NULL,
    role text NOT NULL,
    hourly_cost numeric(18,2) NOT NULL,
    status text NOT NULL DEFAULT 'Pending',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT project_members_pkey PRIMARY KEY (id),
    CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
    CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(supabase_user_id) ON DELETE SET NULL
);

-- Add index for search by email and project
CREATE INDEX IF NOT EXISTS "ix_project_members_project_id" ON public.project_members (project_id);
CREATE INDEX IF NOT EXISTS "ix_project_members_email" ON public.project_members (email);
