import { useState } from 'react';
import { Search, Share2, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProject } from '@/contexts/ProjectContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NotificationsPopover } from '@/components/header/NotificationsPopover';
import { FilterPopover } from '@/components/header/FilterPopover';
import { ShareDialog } from '@/components/header/ShareDialog';
import { InviteDialog } from '@/components/collaboration/InviteDialog';
import { TaskDialog } from '@/components/kanban/TaskDialog';
import { Task } from '@/types/kanban';

export function Header() {
  const { currentProject, teamMembers, addTask, filters, setFilters, searchQuery, setSearchQuery } = useProject();
  const [shareOpen, setShareOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentProject) return;
    await addTask({ ...taskData, project_id: currentProject.id });
  };

  const teamMembersForDialog = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
  }));

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {currentProject?.name || 'No Project Selected'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentProject?.description || 'Create a project to get started'}
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Team Avatars */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 4).map((member) => (
                <Tooltip key={member.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 border-2 border-card hover:z-10 transition-transform hover:scale-110 cursor-pointer">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            {teamMembers.length > 4 && (
              <div className="ml-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                +{teamMembers.length - 4}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:text-primary"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <FilterPopover filters={filters} onFiltersChange={setFilters} teamMembers={teamMembers} />
            <NotificationsPopover />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setTaskDialogOpen(true)}
              disabled={!currentProject}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      {/* Dialogs */}
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        teamMembers={teamMembersForDialog}
        onSave={handleAddTask}
      />
    </>
  );
}
