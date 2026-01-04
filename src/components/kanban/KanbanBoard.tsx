import { useState } from 'react';
import { Task, ColumnId } from '@/types/kanban';
import { columns } from '@/data/mockData';
import { useProject } from '@/contexts/ProjectContext';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './TaskDialog';
import { Loader2 } from 'lucide-react';

export function KanbanBoard() {
  const { 
    tasks, 
    tasksLoading, 
    moveTask, 
    addTask, 
    updateTask, 
    deleteTask, 
    getTasksByColumn,
    teamMembers,
    currentProject 
  } = useProject();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<ColumnId>('todo');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, columnId);
      setDraggedTaskId(null);
    }
  };

  const handleAddTask = (columnId: ColumnId) => {
    setEditingTask(null);
    setDefaultColumnId(columnId);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentProject) return;
    await addTask({ ...taskData, project_id: currentProject.id });
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const teamMembersForDialog = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
  }));

  return (
    <>
      <div className="flex gap-4 p-6 overflow-x-auto">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByColumn(column.id)}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultColumnId={defaultColumnId}
        teamMembers={teamMembersForDialog}
        onSave={handleSaveTask}
        onUpdate={handleUpdateTask}
      />
    </>
  );
}
