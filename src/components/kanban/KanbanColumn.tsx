import { useState } from 'react';
import { Column, Task, ColumnId } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: ColumnId) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDrop: (e: React.DragEvent, columnId: ColumnId) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDrop,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e, column.id);
  };

  return (
    <div
      className={cn(
        'flex flex-col min-w-[300px] max-w-[300px] bg-muted/30 rounded-xl',
        'transition-all duration-200',
        isDragOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className={cn('w-3 h-3 rounded-full', column.color)} />
          <h2 className="font-semibold text-sm text-foreground">{column.title}</h2>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 p-2 pt-0 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
          />
        ))}

        {/* Add Task Button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground h-10"
          onClick={() => onAddTask(column.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add task
        </Button>
      </div>
    </div>
  );
}
