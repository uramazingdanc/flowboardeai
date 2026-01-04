import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TaskFilters } from '@/contexts/ProjectContext';
import { TeamMember } from '@/types/kanban';

interface FilterPopoverProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  teamMembers: TeamMember[];
}

const priorityOptions = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
];

const columnOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export function FilterPopover({ filters, onFiltersChange, teamMembers }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const activeFilterCount =
    filters.priorities.length + filters.assignees.length + filters.columns.length;

  const togglePriority = (priority: string) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const toggleAssignee = (assigneeId: string) => {
    const newAssignees = filters.assignees.includes(assigneeId)
      ? filters.assignees.filter((a) => a !== assigneeId)
      : [...filters.assignees, assigneeId];
    onFiltersChange({ ...filters, assignees: newAssignees });
  };

  const toggleColumn = (column: string) => {
    const newColumns = filters.columns.includes(column)
      ? filters.columns.filter((c) => c !== column)
      : [...filters.columns, column];
    onFiltersChange({ ...filters, columns: newColumns });
  };

  const clearFilters = () => {
    onFiltersChange({ priorities: [], assignees: [], columns: [] });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filter Tasks</h3>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={clearFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="space-y-2">
              {priorityOptions.map((priority) => (
                <div key={priority.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`priority-${priority.value}`}
                    checked={filters.priorities.includes(priority.value)}
                    onCheckedChange={() => togglePriority(priority.value)}
                  />
                  <label
                    htmlFor={`priority-${priority.value}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                    {priority.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {columnOptions.map((column) => (
                <div key={column.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`column-${column.value}`}
                    checked={filters.columns.includes(column.value)}
                    onCheckedChange={() => toggleColumn(column.value)}
                  />
                  <label
                    htmlFor={`column-${column.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assignee</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="assignee-unassigned"
                  checked={filters.assignees.includes('unassigned')}
                  onCheckedChange={() => toggleAssignee('unassigned')}
                />
                <label
                  htmlFor="assignee-unassigned"
                  className="text-sm cursor-pointer"
                >
                  Unassigned
                </label>
              </div>
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`assignee-${member.id}`}
                    checked={filters.assignees.includes(member.id)}
                    onCheckedChange={() => toggleAssignee(member.id)}
                  />
                  <label
                    htmlFor={`assignee-${member.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
