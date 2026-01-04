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
  assignee_id?: string;
  project_id: string;
  dueDate?: string;
  tags: string[];
  google_calendar_event_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbTask {
  id: string;
  title: string;
  description: string | null;
  column_id: string;
  priority: string;
  assignee_id: string | null;
  project_id: string;
  due_date: string | null;
  tags: string[] | null;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: ColumnId;
  title: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}
