-- Fix project creation: allow INSERT policy to apply even when the API session role resolves to 'public'
-- while still requiring a valid authenticated user (auth.uid() is not null).

DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

CREATE POLICY "Authenticated users can create projects"
ON public.projects
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);
