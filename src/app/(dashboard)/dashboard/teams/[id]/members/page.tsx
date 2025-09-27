"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, UserPlus, UserX, Save, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

interface TeamMember extends User {
  user_id: string;
  role_in_crew: string;
  active_from: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  project_id: string;
  project_name: string;
  foreman: User | null;
  members: TeamMember[];
  member_count: number;
}

async function fetchTeam(teamId: string): Promise<Team> {
  const response = await fetch(`/api/crews?team_id=${teamId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team');
  }
  const data = await response.json();
  const teams = data.crews || [];
  return teams[0] || null;
}

async function fetchAvailableUsers(): Promise<User[]> {
  const response = await fetch('/api/users?page=1&per_page=100');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const data = await response.json();
  return data.items || [];
}

async function addMemberToTeam(teamId: string, userId: string, role: string = 'crew') {
  const response = await fetch(`/api/crews/${teamId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      role_in_crew: role,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add member to team');
  }

  return response.json();
}

async function removeMemberFromTeam(teamId: string, userId: string) {
  const response = await fetch(`/api/crews/${teamId}/members/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to remove member from team');
  }

  return response.json();
}

// Helper function to format user roles
const formatUserRole = (role: string): string => {
  switch (role) {
    case 'admin': return 'Admin';
    case 'pm': return 'Project Manager';
    case 'foreman': return 'Foreman';
    case 'crew': return 'Worker';
    case 'worker': return 'Worker';
    case 'viewer': return 'Viewer';
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

// Helper function to format crew roles
const formatCrewRole = (role: string | undefined | null): string => {
  if (!role) return 'Member';

  switch (role) {
    case 'leader': return 'Leader';
    case 'member': return 'Member';
    case 'trainee': return 'Trainee';
    // Legacy compatibility
    case 'worker': return 'Member';
    case 'foreman': return 'Leader';
    case 'operator': return 'Member';
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

export default function TeamMembersPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch team data
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => fetchTeam(teamId),
    enabled: !!teamId,
  });

  // Fetch available users
  const { data: availableUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchAvailableUsers,
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      addMemberToTeam(teamId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: "Member Added",
        description: "Member successfully added to team",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add member to team",
        variant: "destructive",
      });
      console.error('Add member error:', error);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeMemberFromTeam(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({
        title: "Member Removed",
        description: "Member removed from team",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove member from team",
        variant: "destructive",
      });
      console.error('Remove member error:', error);
    },
  });

  const handleAddMember = (userId: string, role: string = 'member') => {
    addMemberMutation.mutate({ userId, role });
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate(userId);
  };

  if (teamLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 animate-pulse bg-muted rounded" />
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse bg-muted rounded" />
            <div className="h-4 w-64 animate-pulse bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-destructive">
              Team Not Found
            </h1>
          </div>
        </div>
      </div>
    );
  }

  // Filter available users (exclude current members and foreman)
  const currentMemberIds = team.members.map(m => m.user_id);
  if (team.foreman) {
    currentMemberIds.push(team.foreman.id);
  }

  const filteredAvailableUsers = availableUsers
    .filter(user => !currentMemberIds.includes(user.id))
    .filter(user => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/teams')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Teams</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Team Members: {team.name}
          </h1>
          <p className="text-muted-foreground">
            Manage team members
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Current Members ({team.members.length + (team.foreman ? 1 : 0)})</span>
            </CardTitle>
            <CardDescription>
              Members of this team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Foreman */}
            {team.foreman && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {team.foreman.first_name?.[0]}{team.foreman.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{team.foreman.full_name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Foreman</Badge>
                      <span className="text-sm text-muted-foreground">
                        {team.foreman.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            {team.members.length > 0 ? (
              team.members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.full_name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {formatCrewRole(member.role_in_crew)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.user_id)}
                    disabled={removeMemberMutation.isPending}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Add Members</span>
            </CardTitle>
            <CardDescription>
              Available users to add to the team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Separator />

            {/* Available Users List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {usersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                </div>
              ) : filteredAvailableUsers.length > 0 ? (
                filteredAvailableUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{formatUserRole(user.role)}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddMember(user.id, 'member')}
                      disabled={addMemberMutation.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchQuery ? 'No users found' : 'All users are already in the team'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}