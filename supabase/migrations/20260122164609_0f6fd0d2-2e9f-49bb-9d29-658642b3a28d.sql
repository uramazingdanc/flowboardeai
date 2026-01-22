-- 1) Ensure owner_id is always set to the current user on INSERT
CREATE OR REPLACE FUNCTION public.set_project_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When called from a normal authenticated request, force ownership to the current user
  IF auth.uid() IS NOT NULL THEN
    NEW.owner_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_project_owner ON public.projects;
CREATE TRIGGER set_project_owner
BEFORE INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_project_owner();

-- 2) Relax INSERT policy to only require authentication (owner_id is enforced by trigger above)
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3) Fix linter warning: don't allow blanket notification inserts
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Project members can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  project_id IS NULL
  OR public.is_project_member(project_id)
);