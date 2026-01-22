-- Drop the problematic projects SELECT policy
DROP POLICY IF EXISTS "Project members can view projects" ON public.projects;

-- Create a security definer function to check if user can access a project
-- This avoids the infinite recursion by bypassing RLS
CREATE OR REPLACE FUNCTION public.can_access_project(check_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = check_project_id AND p.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = check_project_id AND pm.user_id = auth.uid()
  )
$$;

-- Create a proper SELECT policy for projects using the security definer function
CREATE POLICY "Project members can view projects" 
ON public.projects 
FOR SELECT 
USING (public.can_access_project(id));