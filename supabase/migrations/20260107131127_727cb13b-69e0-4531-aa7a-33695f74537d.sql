-- Drop existing task policies
DROP POLICY IF EXISTS "Project members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project members can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project members can delete tasks" ON public.tasks;

-- Create a security definer function to check project membership
CREATE OR REPLACE FUNCTION public.is_project_member(check_project_id uuid)
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

-- Create proper RLS policies for tasks that reference the task's project_id
CREATE POLICY "Project members can view tasks" 
ON public.tasks 
FOR SELECT 
USING (public.is_project_member(project_id));

CREATE POLICY "Project members can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (public.is_project_member(project_id));

CREATE POLICY "Project members can update tasks" 
ON public.tasks 
FOR UPDATE 
USING (public.is_project_member(project_id));

CREATE POLICY "Project members can delete tasks" 
ON public.tasks 
FOR DELETE 
USING (public.is_project_member(project_id));

-- Also fix the projects RLS policy that has an issue
DROP POLICY IF EXISTS "Project members can view projects" ON public.projects;

CREATE POLICY "Project members can view projects" 
ON public.projects 
FOR SELECT 
USING (
  owner_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
  )
);