import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import { useProject } from '@/contexts/ProjectContext';
import { Task } from '@/types/kanban';

const Board = () => {
  const { addTask, teamMembers, currentProject } = useProject();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 pb-0">
        <h1 className="text-2xl font-bold text-foreground">Board</h1>
        <p className="text-muted-foreground">
          {currentProject ? `Manage tasks for ${currentProject.name}` : 'Select a project to get started'}
        </p>
      </div>
      <div className="flex-1 overflow-x-auto">
        <KanbanBoard />
      </div>
      <TaskDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        teamMembers={teamMembersForDialog}
        onSave={handleQuickAdd}
      />
    </div>
  );
};

export default Board;
