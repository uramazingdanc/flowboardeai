import { useState } from 'react';
import { Task, ColumnId } from '@/types/kanban';
import { columns } from '@/data/mockData';
import { useKanban } from '@/hooks/useKanban';
import { KanbanColumn } from './KanbanColumn';
import { TaskDialog } from './TaskDialog';

export function KanbanBoard() {
  const { tasks, moveTask, addTask, updateTask, deleteTask, getTasksByColumn } = useKanban();
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

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Partial<Task>) => {
    if ('id' in taskData && taskData.id) {
      updateTask(taskData.id, taskData);
    } else {
      addTask(taskData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

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
        onSave={handleSaveTask}
      />
    </>
  );
}
