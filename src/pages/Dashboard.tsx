import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { columns } from '@/data/mockData';
import { CheckCircle2, Clock, ListTodo, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { tasks, currentProject, projects } = useProject();

  const tasksByColumn = columns.map((col) => ({
    ...col,
    count: tasks.filter((t) => t.columnId === col.id).length,
  }));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.columnId === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.columnId === 'in-progress').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high').length;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: ListTodo, color: 'text-blue-500' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'In Progress', value: inProgressTasks, icon: Clock, color: 'text-yellow-500' },
    { label: 'High Priority', value: highPriorityTasks, icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          {currentProject ? `Overview of ${currentProject.name}` : 'Select a project to get started'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-10 w-10 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Column Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasksByColumn.map((col) => (
              <div key={col.id} className="flex items-center gap-4">
                <div className="w-32 text-sm text-muted-foreground">{col.title}</div>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: totalTasks ? `${(col.count / totalTasks) * 100}%` : '0%' }}
                  />
                </div>
                <div className="w-12 text-sm font-medium text-foreground text-right">{col.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground">No projects yet. Create one to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    project.id === currentProject?.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <h3 className="font-medium text-foreground">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
