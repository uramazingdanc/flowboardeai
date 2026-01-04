import { useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isValid } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

const Timeline = () => {
  const { tasks, currentProject } = useProject();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const tasksWithDueDates = useMemo(() => {
    return tasks.filter((t) => t.dueDate);
  }, [tasks]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return tasksWithDueDates.filter((t) => {
      const dueDate = parseISO(t.dueDate!);
      return isValid(dueDate) && isSameDay(dueDate, selectedDate);
    });
  }, [selectedDate, tasksWithDueDates]);

  const datesWithTasks = useMemo(() => {
    return tasksWithDueDates
      .map((t) => {
        const d = parseISO(t.dueDate!);
        return isValid(d) ? d : null;
      })
      .filter(Boolean) as Date[];
  }, [tasksWithDueDates]);

  const priorityColors: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
        <p className="text-muted-foreground">
          {currentProject ? `Task timeline for ${currentProject.name}` : 'Select a project to view timeline'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasTasks: datesWithTasks,
              }}
              modifiersStyles={{
                hasTasks: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  textDecorationColor: 'hsl(var(--primary))',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Tasks for Selected Date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Tasks for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateTasks.length === 0 ? (
              <p className="text-muted-foreground">No tasks due on this date.</p>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {task.columnId.replace('-', ' ')}
                          </Badge>
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`}
                        title={`${task.priority} priority`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>All Scheduled Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasksWithDueDates.length === 0 ? (
            <p className="text-muted-foreground">No tasks with due dates yet.</p>
          ) : (
            <div className="space-y-2">
              {tasksWithDueDates
                .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{task.title}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {task.columnId.replace('-', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(parseISO(task.dueDate!), 'MMM d')}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Timeline;
