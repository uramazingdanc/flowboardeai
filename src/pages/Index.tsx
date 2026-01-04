import { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TeamPanel } from '@/components/collaboration/TeamPanel';
import { InviteDialog } from '@/components/collaboration/InviteDialog';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import { useKanban } from '@/hooks/useKanban';
import { Task } from '@/types/kanban';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [teamPanelOpen, setTeamPanelOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { addTask } = useKanban();

  const handleQuickAdd = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTask(taskData);
  };

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
        onSave={handleQuickAdd}
      />
    </div>
  );
};

export default Index;
