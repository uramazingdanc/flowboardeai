import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, Profile } from '@/types/kanban';
import { toast } from 'sonner';

function profileToTeamMember(profile: Profile): TeamMember {
  return {
    id: profile.id,
    name: profile.full_name || profile.email || 'Unknown',
    email: profile.email || '',
    avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
    role: profile.role || 'Member',
    isOnline: false,
  };
}

export function useTeamMembers(projectId: string | null) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    if (!projectId) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    // Get project owner and members
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error(projectError);
      setLoading(false);
      return;
    }

    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId);

    if (membersError) {
      console.error(membersError);
    }

    const userIds = [
      project.owner_id,
      ...(members?.map((m) => m.user_id) || []),
    ].filter((id, index, self) => self.indexOf(id) === index);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error(profilesError);
    } else {
      setTeamMembers((profiles as Profile[]).map(profileToTeamMember));
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const inviteMember = async (email: string) => {
    // Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileError || !profile) {
      toast.error('User not found. They need to sign up first.');
      return false;
    }

    if (!projectId) {
      toast.error('No project selected');
      return false;
    }

    const { error } = await supabase.from('project_members').insert({
      project_id: projectId,
      user_id: profile.id,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('User is already a member');
      } else {
        toast.error('Failed to invite member');
        console.error(error);
      }
      return false;
    }

    toast.success('Member invited!');
    fetchTeamMembers();
    return true;
  };

  const removeMember = async (userId: string) => {
    if (!projectId) return false;

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to remove member');
      console.error(error);
      return false;
    }

    setTeamMembers((prev) => prev.filter((m) => m.id !== userId));
    toast.success('Member removed');
    return true;
  };

  return {
    teamMembers,
    loading,
    inviteMember,
    removeMember,
    refreshTeamMembers: fetchTeamMembers,
  };
}
