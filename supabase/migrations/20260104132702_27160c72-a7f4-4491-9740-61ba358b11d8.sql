-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create project_members junction table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  column_id TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects (members can view/edit)
CREATE POLICY "Project members can view projects" ON public.projects 
  FOR SELECT TO authenticated 
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid()
  ));

CREATE POLICY "Owners can update projects" ON public.projects 
  FOR UPDATE TO authenticated 
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete projects" ON public.projects 
  FOR DELETE TO authenticated 
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create projects" ON public.projects 
  FOR INSERT TO authenticated 
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for project_members
CREATE POLICY "Project members can view members" ON public.project_members 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Project owners can manage members" ON public.project_members 
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Users can join projects" ON public.project_members 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for tasks
CREATE POLICY "Project members can view tasks" ON public.tasks 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    LEFT JOIN public.project_members pm ON pm.project_id = p.id 
    WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
  ));

CREATE POLICY "Project members can create tasks" ON public.tasks 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p 
    LEFT JOIN public.project_members pm ON pm.project_id = p.id 
    WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
  ));

CREATE POLICY "Project members can update tasks" ON public.tasks 
  FOR UPDATE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    LEFT JOIN public.project_members pm ON pm.project_id = p.id 
    WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
  ));

CREATE POLICY "Project members can delete tasks" ON public.tasks 
  FOR DELETE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    LEFT JOIN public.project_members pm ON pm.project_id = p.id 
    WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
  ));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;