import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Save, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const { profile } = useAuth();
  const { currentProject, updateProject, deleteProject, projects, setCurrentProject } = useProject();
  
  const [projectName, setProjectName] = useState(currentProject?.name || '');
  const [projectDesc, setProjectDesc] = useState(currentProject?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync form with current project
  useState(() => {
    if (currentProject) {
      setProjectName(currentProject.name);
      setProjectDesc(currentProject.description || '');
    }
  });

  const handleSaveProject = async () => {
    if (!currentProject) return;
    
    setIsSaving(true);
    const success = await updateProject(currentProject.id, {
      name: projectName,
      description: projectDesc,
    });
    setIsSaving(false);
    
    if (success) {
      toast.success('Project settings saved!');
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    
    setIsDeleting(true);
    const success = await deleteProject(currentProject.id);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    
    if (success) {
      // Switch to another project if available
      const remainingProjects = projects.filter((p) => p.id !== currentProject.id);
      if (remainingProjects.length > 0) {
        setCurrentProject(remainingProjects[0]);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your project and account settings</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} />
              <AvatarFallback className="text-xl">
                {profile?.full_name?.split(' ').map((n) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{profile?.full_name || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">{profile?.role || 'Member'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Settings */}
      {currentProject ? (
        <Card>
          <CardHeader>
            <CardTitle>Project Settings</CardTitle>
            <CardDescription>Manage settings for {currentProject.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
              />
            </div>
            <Button onClick={handleSaveProject} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Select a project to manage its settings.</p>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      {currentProject && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Delete Project</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this project and all its data
                </p>
              </div>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{currentProject?.name}" and all associated tasks and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
