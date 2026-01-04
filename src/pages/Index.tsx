import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TeamPanel } from '@/components/collaboration/TeamPanel';
import { InviteDialog } from '@/components/collaboration/InviteDialog';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/contexts/ProjectContext';
import { Task } from '@/types/kanban';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addTask, teamMembers, currentProject } = useProject();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [teamPanelOpen, setTeamPanelOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleQuickAdd = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentProject) return;
    await addTask({ ...taskData, project_id: currentProject.id });
  };

  const teamMembersForDialog = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onAddTask={() => setQuickAddOpen(true)}
          onInvite={() => setInviteDialogOpen(true)}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Kanban Board */}
          <main className="flex-1 overflow-x-auto">
            <KanbanBoard />
          </main>

          {/* Team Panel */}
          <TeamPanel open={teamPanelOpen} onClose={() => setTeamPanelOpen(false)} />
        </div>
      </div>

      {/* Dialogs */}
      <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
      <TaskDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        teamMembers={teamMembersForDialog}
        onSave={handleQuickAdd}
      />
    </div>
  );
};

export default Index;
