import { useState, useCallback } from 'react';
import { Task, ColumnId } from '@/types/kanban';
import { initialTasks, teamMembers } from '@/data/mockData';

export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const moveTask = useCallback((taskId: string, newColumnId: ColumnId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, columnId: newColumnId, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const getTasksByColumn = useCallback(
    (columnId: ColumnId) => tasks.filter((task) => task.columnId === columnId),
    [tasks]
  );

  return {
    tasks,
    teamMembers,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
    getTasksByColumn,
  };
}
