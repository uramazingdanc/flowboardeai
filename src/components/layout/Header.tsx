import { Search, Bell, Share2, Filter, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProject } from '@/contexts/ProjectContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeaderProps {
  onAddTask: () => void;
  onInvite: () => void;
}

export function Header({ onAddTask, onInvite }: HeaderProps) {
  const { currentProject, teamMembers } = useProject();

  return (
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
            onClick={onInvite}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button size="sm" className="gap-2" onClick={onAddTask} disabled={!currentProject}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>
    </header>
  );
}
