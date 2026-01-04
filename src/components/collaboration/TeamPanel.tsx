import { X, Circle, Mail, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { teamMembers } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamPanelProps {
  open: boolean;
  onClose: () => void;
}

export function TeamPanel({ open, onClose }: TeamPanelProps) {
  if (!open) return null;

  return (
    <div className="w-80 bg-card border-l border-border h-full flex flex-col animate-slide-in">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Team Members</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{teamMembers.length}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-column-done">
              {teamMembers.filter((m) => m.isOnline).length}
            </p>
            <p className="text-xs text-muted-foreground">Online Now</p>
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Circle
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5',
                    member.isOnline
                      ? 'text-column-done fill-column-done'
                      : 'text-muted-foreground fill-muted'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Send message
                  </DropdownMenuItem>
                  <DropdownMenuItem>View profile</DropdownMenuItem>
                  <DropdownMenuItem>Assign task</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Section */}
      <div className="p-4 border-t border-border">
        <Button className="w-full" variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      </div>
    </div>
  );
}
