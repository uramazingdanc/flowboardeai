export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type ColumnId = 'todo' | 'in-progress' | 'review' | 'done';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isOnline: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
  priority: Priority;
  assignee?: TeamMember;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  tasks: Task[];
  createdAt: string;
}
