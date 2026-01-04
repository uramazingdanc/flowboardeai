import { createContext, useContext, ReactNode } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Project, Task, TeamMember, ColumnId } from '@/types/kanban';

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
  tasksLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  moveTask: (taskId: string, newColumnId: ColumnId) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  getTasksByColumn: (columnId: ColumnId) => Task[];
  
  // Team Members
  teamMembers: TeamMember[];
  teamLoading: boolean;
  inviteMember: (email: string) => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
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
        tasksLoading,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
        getTasksByColumn,
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
