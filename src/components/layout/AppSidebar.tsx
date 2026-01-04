import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Users,
  Settings,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentProject } from '@/data/mockData';
import { useState } from 'react';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: false },
  { icon: KanbanSquare, label: 'Board', active: true },
  { icon: Calendar, label: 'Timeline', active: false },
  { icon: Users, label: 'Team', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

const projects = [
  { id: '1', name: 'Startup MVP', color: 'bg-primary' },
  { id: '2', name: 'Marketing Site', color: 'bg-column-progress' },
  { id: '3', name: 'Mobile App', color: 'bg-column-review' },
];

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground text-lg">FlowBoard</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  item.active
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>

        {/* Projects Section */}
        {!collapsed && (
          <div className="mt-8 px-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                Projects
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-sidebar-muted hover:text-sidebar-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ul className="space-y-1">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      project.id === '1'
                        ? 'bg-sidebar-accent text-sidebar-foreground'
                        : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full', project.color)} />
                    <span className="text-sm truncate">{project.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-sidebar-muted truncate">john@startup.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
