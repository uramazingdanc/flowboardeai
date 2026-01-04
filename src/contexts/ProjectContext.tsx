import { createContext, useContext, ReactNode, useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Project, Task, TeamMember, ColumnId } from '@/types/kanban';

export interface TaskFilters {
  priorities: string[];
  assignees: string[];
  columns: string[];
}

interface ProjectContextType {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  projectsLoading: boolean;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  
  // Tasks
  tasks: Task[];
  filteredTasks: Task[];
  tasksLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  moveTask: (taskId: string, newColumnId: ColumnId) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  getTasksByColumn: (columnId: ColumnId) => Task[];
  getFilteredTasksByColumn: (columnId: ColumnId) => Task[];
  
  // Filters
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Team Members
  teamMembers: TeamMember[];
  teamLoading: boolean;
  inviteMember: (email: string) => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<TaskFilters>({
    priorities: [],
    assignees: [],
    columns: [],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const {
    projects,
    currentProject,
    setCurrentProject,
    loading: projectsLoading,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const {
    tasks,
    loading: tasksLoading,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    getTasksByColumn,
  } = useTasks(currentProject?.id || null);

  const {
    teamMembers,
    loading: teamLoading,
    inviteMember,
    removeMember,
  } = useTeamMembers(currentProject?.id || null);

  // Filter tasks based on current filters and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (filters.priorities.length > 0) {
        if (!filters.priorities.includes(task.priority)) return false;
      }

      // Column/Status filter
      if (filters.columns.length > 0) {
        if (!filters.columns.includes(task.columnId)) return false;
      }

      // Assignee filter
      if (filters.assignees.length > 0) {
        const taskAssignee = task.assignee_id || 'unassigned';
        if (!filters.assignees.includes(taskAssignee)) return false;
      }

      return true;
    });
  }, [tasks, filters, searchQuery]);

  const getFilteredTasksByColumn = (columnId: ColumnId) => {
    return filteredTasks.filter((task) => task.columnId === columnId);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        projectsLoading,
        createProject,
        updateProject,
        deleteProject,
        tasks,
        filteredTasks,
        tasksLoading,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
        getTasksByColumn,
        getFilteredTasksByColumn,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        teamMembers,
        teamLoading,
        inviteMember,
        removeMember,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
