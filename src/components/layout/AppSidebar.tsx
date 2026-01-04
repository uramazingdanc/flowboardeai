import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/contexts/ProjectContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: KanbanSquare, label: 'Board', path: '/board' },
  { icon: Calendar, label: 'Timeline', path: '/timeline' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { projects, currentProject, setCurrentProject, createProject, projectsLoading } = useProject();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    await createProject(newProjectName, newProjectDesc);
    setIsCreating(false);
    setNewProjectName('');
    setNewProjectDesc('');
    setCreateDialogOpen(false);
  };

  const projectColors = ['bg-primary', 'bg-column-progress', 'bg-column-review', 'bg-column-done'];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <>
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
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive(item.path)
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
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              {projectsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-sidebar-muted" />
                </div>
              ) : projects.length === 0 ? (
                <p className="text-xs text-sidebar-muted px-3 py-2">No projects yet</p>
              ) : (
                <ul className="space-y-1">
                  {projects.map((project, index) => (
                    <li key={project.id}>
                      <button
                        onClick={() => setCurrentProject(project)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          project.id === currentProject?.id
                            ? 'bg-sidebar-accent text-sidebar-foreground'
                            : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )}
                      >
                        <div className={cn('w-2 h-2 rounded-full', projectColors[index % projectColors.length])} />
                        <span className="text-sm truncate">{project.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} />
              <AvatarFallback>
                {profile?.full_name?.split(' ').map((n) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-sidebar-muted truncate">{profile?.email}</p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-sidebar-muted hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Awesome Project"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description (optional)</Label>
              <Textarea
                id="project-desc"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
