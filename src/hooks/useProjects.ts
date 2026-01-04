import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/kanban';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } else {
      setProjects(data as Project[]);
      if (data.length > 0 && !currentProject) {
        setCurrentProject(data[0] as Project);
      }
    }
    setLoading(false);
  }, [user, currentProject]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string, description?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create project');
      console.error(error);
      return null;
    }

    const project = data as Project;
    setProjects((prev) => [project, ...prev]);
    setCurrentProject(project);
    toast.success('Project created!');
    return project;
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (error) {
      toast.error('Failed to update project');
      console.error(error);
      return false;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
    if (currentProject?.id === projectId) {
      setCurrentProject({ ...currentProject, ...updates });
    }
    toast.success('Project updated!');
    return true;
  };

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast.error('Failed to delete project');
      console.error(error);
      return false;
    }

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(projects.find((p) => p.id !== projectId) || null);
    }
    toast.success('Project deleted!');
    return true;
  };

  return {
    projects,
    currentProject,
    setCurrentProject,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
  };
}
