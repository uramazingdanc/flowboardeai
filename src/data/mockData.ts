import { Column } from '@/types/kanban';

export const columns: Column[] = [
  { id: 'todo', title: 'To Do', color: 'column-todo' },
  { id: 'in-progress', title: 'In Progress', color: 'column-progress' },
  { id: 'review', title: 'Review', color: 'column-review' },
  { id: 'done', title: 'Done', color: 'column-done' },
];
