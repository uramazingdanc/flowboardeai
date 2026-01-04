import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, ColumnId, DbTask, Profile } from '@/types/kanban';
import { toast } from 'sonner';

function mapDbTaskToTask(dbTask: DbTask, profiles: Profile[]): Task {
  const assignee = profiles.find((p) => p.id === dbTask.assignee_id);
  
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    columnId: dbTask.column_id as ColumnId,
    priority: dbTask.priority as Task['priority'],
    assignee: assignee
      ? {
          id: assignee.id,
          name: assignee.full_name || assignee.email || 'Unknown',
          email: assignee.email || '',
          avatar: assignee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee.id}`,
          role: assignee.role || 'Member',
          isOnline: false,
        }
      : undefined,
    assignee_id: dbTask.assignee_id || undefined,
    project_id: dbTask.project_id,
    dueDate: dbTask.due_date || undefined,
    tags: dbTask.tags || [],
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
  };
}

export function useTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      setProfiles(data as Profile[]);
    }
    return data as Profile[] || [];
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const profilesData = await fetchProfiles();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } else {
      setTasks((data as DbTask[]).map((t) => mapDbTaskToTask(t, profilesData)));
    }
    setLoading(false);
  }, [projectId, fetchProfiles]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = mapDbTaskToTask(payload.new as DbTask, profiles);
            setTasks((prev) => [newTask, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = mapDbTaskToTask(payload.new as DbTask, profiles);
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== (payload.old as DbTask).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, profiles]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!projectId) return null;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description || null,
        project_id: projectId,
        column_id: task.columnId,
        priority: task.priority,
        assignee_id: task.assignee_id || null,
        due_date: task.dueDate || null,
        tags: task.tags,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create task');
      console.error(error);
      return null;
    }

    toast.success('Task created!');
    return mapDbTaskToTask(data as DbTask, profiles);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const dbUpdates: Partial<DbTask> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.columnId !== undefined) dbUpdates.column_id = updates.columnId;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.assignee_id !== undefined) dbUpdates.assignee_id = updates.assignee_id || null;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to update task');
      console.error(error);
      return false;
    }

    return true;
  };

  const moveTask = async (taskId: string, newColumnId: ColumnId) => {
    return updateTask(taskId, { columnId: newColumnId });
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      toast.error('Failed to delete task');
      console.error(error);
      return false;
    }

    toast.success('Task deleted!');
    return true;
  };

  const getTasksByColumn = useCallback(
    (columnId: ColumnId) => tasks.filter((task) => task.columnId === columnId),
    [tasks]
  );

  return {
    tasks,
    profiles,
    loading,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    getTasksByColumn,
    refreshTasks: fetchTasks,
  };
}
