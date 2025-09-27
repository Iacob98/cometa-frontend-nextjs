"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  project_name?: string;
  members?: any[];
  member_count: number;
}

interface User {
  id: string;
  full_name: string;
  email?: string;
  role: string;
}

interface AssignUserToTeamDialogProps {
  user: User;
  teams: Team[];
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

async function addUserToTeam(teamId: string, userId: string, role: string = 'member') {
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to add user to team');
  }

  return response.json();
}

export default function AssignUserToTeamDialog({
  user,
  teams,
  children,
  open: controlledOpen,
  onOpenChange,
  onSuccess
}: AssignUserToTeamDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Filter out teams where user is already a member
  const availableTeams = teams.filter(team =>
    !team.members?.some(member => member.user_id === user.id)
  );

  const addToTeamMutation = useMutation({
    mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) =>
      addUserToTeam(teamId, userId, role),
    onSuccess: () => {
      // Use correct cache keys from useTeams hook
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', 'crews'] });
      queryClient.invalidateQueries({ queryKey: ['crews'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      toast({
        title: "Пользователь добавлен в команду",
        description: `${user.full_name} добавлен в команду "${selectedTeam?.name}"`,
      });

      setOpen(false);
      setSelectedTeamId("");
      setSelectedRole("member");

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось добавить пользователя в команду",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedTeamId) {
      toast({
        title: "Ошибка",
        description: "Выберите команду для назначения",
        variant: "destructive",
      });
      return;
    }

    addToTeamMutation.mutate({
      teamId: selectedTeamId,
      userId: user.id,
      role: selectedRole,
    });
  };

  const handleManageMembers = () => {
    if (selectedTeamId) {
      setOpen(false);
      router.push(`/dashboard/teams/${selectedTeamId}/members`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Назначить пользователя в команду</DialogTitle>
          <DialogDescription>
            Выберите команду для добавления пользователя <strong>{user.full_name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
            <div className="flex-1">
              <div className="font-medium">{user.full_name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <Badge variant="outline">{user.role}</Badge>
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team-select">Выберите команду</Label>
            {availableTeams.length > 0 ? (
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите команду" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{team.name}</div>
                          {team.project_name && (
                            <div className="text-sm text-muted-foreground">
                              Проект: {team.project_name}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {team.member_count} участников
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Пользователь уже назначен во все доступные команды
                </p>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role-select">Роль в команде</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Участник</SelectItem>
                <SelectItem value="leader">Лидер</SelectItem>
                <SelectItem value="trainee">Стажер</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {selectedTeamId && (
            <Button
              type="button"
              variant="outline"
              onClick={handleManageMembers}
              className="w-full sm:w-auto"
            >
              Управлять участниками
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 sm:flex-initial"
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={!selectedTeamId || addToTeamMutation.isPending || availableTeams.length === 0}
              className="flex-1 sm:flex-initial"
            >
              {addToTeamMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Назначить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}