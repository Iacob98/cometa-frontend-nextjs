"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Users, UserPlus, Eye, Edit, Trash2, Phone, Mail, MapPin, FileText, Calendar, Shield, Globe, Code } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { useTeams, useDeleteCrew, useCreateTeam, useUpdateTeam, useForemenUsers } from "@/hooks/use-teams";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import WorkerDocumentsDialog from "@/components/documents/worker-documents-dialog";
import { usePermissions } from "@/hooks/use-auth";
import CreateUserForm from "@/components/features/user-management/create-user-form";
import AssignUserToTeamDialog from "@/components/teams/assign-user-to-team-dialog";


// Validation schema for creating/editing teams
const teamSchema = z.object({
  name: z.string().min(1, "Название команды обязательно"),
  foreman_user_id: z.string().optional(),
  project_id: z.string().optional(),
  description: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

// Component to display user documents summary
function UserDocumentsSummary({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['worker-documents', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      return response.json();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Документы
        </CardTitle>
        <CardDescription>
          Документы пользователя, договоры и сертификаты
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !data?.documents?.all || data.documents.all.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>Документы ещё не загружены</p>
            <p className="text-xs mt-2">Нажмите «Управление документами», чтобы добавить документы</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{data.stats.total}</div>
                <div className="text-xs text-muted-foreground">Всего</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.stats.active}</div>
                <div className="text-xs text-muted-foreground">Активно</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{data.stats.expiring_soon}</div>
                <div className="text-xs text-muted-foreground">Истекает</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{data.stats.expired}</div>
                <div className="text-xs text-muted-foreground">Просрочено</div>
              </div>
            </div>

            {/* Recent Documents */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Последние документы ({Math.min(data.documents.all.length, 3)})</div>
              {data.documents.all.slice(0, 3).map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: doc.category.color }}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{doc.category.name_de || doc.category.name_en}</div>
                      <div className="text-xs text-muted-foreground">{doc.file_name}</div>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'active' ? 'default' : doc.status === 'expired' ? 'destructive' : 'secondary'}>
                    {doc.status === 'active' ? 'Активно' : doc.status === 'expired' ? 'Просрочено' : doc.status}
                  </Badge>
                </div>
              ))}
              {data.documents.all.length > 3 && (
                <div className="text-xs text-center text-muted-foreground pt-2">
                  +{data.documents.all.length - 3} ещё документов
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeamsPage() {
  const router = useRouter();
  const { canManageTeams } = usePermissions();
  const deleteCrew = useDeleteCrew();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [showEditTeamDialog, setShowEditTeamDialog] = useState(false);
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToAssign, setUserToAssign] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [defaultUserRole, setDefaultUserRole] = useState<string>("crew");

  // Bulk operations state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

  const createTeamForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      foreman_user_id: "none",
      project_id: "none",
      description: "",
    },
  });

  const editTeamForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      foreman_user_id: "none",
      project_id: "none",
      description: "",
    },
  });

  const { data: crews, isLoading: crewsLoading, error: crewsError } = useTeams();

  // Get query client for manual refresh
  const queryClient = useQueryClient();

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    page: 1,
    per_page: 100 // Load more users to see all of them
  });
  const { data: foremenUsers } = useForemenUsers();

  const users = usersResponse?.items || [];

  // Helper function to check if user is assigned to any team
  const isUserAssignedToTeam = (userId: string): boolean => {
    if (!crews) return false;

    return crews.some(crew =>
      // Check if user is foreman of any crew
      crew.foreman?.id === userId ||
      // Check if user is member of any crew
      crew.members?.some(member => member.user_id === userId)
    );
  };

  // Helper function to get user's team name
  const getUserTeamName = (userId: string): string | null => {
    if (!crews) return null;

    const userCrew = crews.find(crew =>
      crew.foreman?.id === userId ||
      crew.members?.some(member => member.user_id === userId)
    );

    return userCrew?.name || null;
  };

  // Filter workers: only show those not assigned to any team
  const availableWorkers = users.filter(user =>
    ["crew", "worker", "foreman"].includes(user.role) &&
    !isUserAssignedToTeam(user.id)
  );

  // Filter users based on search query for the "All Users" tab
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const teamName = getUserTeamName(user.id);

    return (
      user.full_name.toLowerCase().includes(query) ||
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.skills?.some(skill => skill.toLowerCase().includes(query)) ||
      (teamName && teamName.toLowerCase().includes(query))
    );
  });

  const handleDeleteCrew = async (crewId: string, crewName: string) => {
    if (confirm(`Вы уверены, что хотите удалить "${crewName}"? Это действие нельзя отменить.`)) {
      await deleteCrew.mutateAsync(crewId);
    }
  };

  const handleUserCreated = () => {
    setShowCreateUserDialog(false);
    // The CreateUserForm component handles success notifications and query invalidation
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setShowUserDetailDialog(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditUserDialog(true);
    setShowUserDetailDialog(false);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setShowDeleteUserDialog(true);
    setShowUserDetailDialog(false);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync(selectedUser.id);
      setShowDeleteUserDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // Bulk operations handlers
  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      // Use different user lists based on the current tab context
      const allUserIds = filteredUsers.map(user => user.id);
      setSelectedUsers(new Set(allUserIds));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setShowBulkActionsDialog(true);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    try {
      const userIds = Array.from(selectedUsers);

      if (bulkAction === "delete") {
        // Delete selected users
        await Promise.all(userIds.map(id => deleteUser.mutateAsync(id)));
      } else if (bulkAction.startsWith("role_")) {
        // Update roles
        const newRole = bulkAction.replace("role_", "");
        await Promise.all(
          userIds.map(id => {
            const user = users.find(u => u.id === id);
            if (user) {
              return updateUser.mutateAsync({
                id,
                data: { ...user, role: newRole }
              });
            }
          })
        );
      }

      setShowBulkActionsDialog(false);
      setSelectedUsers(new Set());
      setBulkAction("");
    } catch (error) {
      console.error("Failed to perform bulk action:", error);
    }
  };

  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      // Convert "none" values to undefined for API
      const apiData = {
        ...data,
        foreman_user_id: data.foreman_user_id === "none" ? undefined : data.foreman_user_id,
        project_id: data.project_id === "none" ? undefined : data.project_id,
      };
      await createTeam.mutateAsync(apiData);
      setShowCreateTeamDialog(false);
      createTeamForm.reset();
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to create team:", error);
    }
  };

  const handleEditTeam = (team: any) => {
    setEditingTeam(team);
    editTeamForm.setValue("name", team.name);
    editTeamForm.setValue("foreman_user_id", team.foreman?.id || "none");
    editTeamForm.setValue("project_id", team.project_id || "none");
    editTeamForm.setValue("description", team.description || "");
    setShowEditTeamDialog(true);
  };

  const handleUpdateTeam = async (data: TeamFormData) => {
    if (!editingTeam) return;

    try {
      // Convert "none" values to undefined for API
      const apiData = {
        ...data,
        foreman_user_id: data.foreman_user_id === "none" ? undefined : data.foreman_user_id,
        project_id: data.project_id === "none" ? undefined : data.project_id,
      };
      await updateTeam.mutateAsync({ id: editingTeam.id, data: apiData });
      setShowEditTeamDialog(false);
      setEditingTeam(null);
      editTeamForm.reset();
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to update team:", error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "foreman":
        return "default";
      case "crew":
      case "worker":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (crewsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Команды</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Не удалось загрузить команды. Попробуйте позже.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Команды</h1>
          <p className="text-muted-foreground">
            Управление рабочими бригадами и назначениями
          </p>
        </div>
        {canManageTeams && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDefaultUserRole("crew");
                setShowCreateUserDialog(true);
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить участника
            </Button>
            <Button onClick={() => setShowCreateTeamDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Новая команда
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="crews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crews">Бригады ({crews?.length || 0})</TabsTrigger>
          <TabsTrigger value="available">Свободные работники ({availableWorkers.length})</TabsTrigger>
          <TabsTrigger value="all-users">Все пользователи ({users.length})</TabsTrigger>
          <TabsTrigger value="overview">Обзор команд</TabsTrigger>
        </TabsList>

        <TabsContent value="crews" className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Фильтр команд</CardTitle>
              <CardDescription>
                Поиск команд по названию или бригадиру
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, бригадиру или проекту..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Teams Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {crewsLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : crews?.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-semibold">Команды не найдены</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Начните с создания первой рабочей бригады.
                      </p>
                      {canManageTeams && (
                        <Button
                          className="mt-4"
                          onClick={() => router.push("/dashboard/teams/new")}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Создать команду
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              crews
                ?.filter(crew =>
                  !searchQuery ||
                  crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  crew.foreman?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((crew) => (
                  <Card key={crew.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{crew.name}</CardTitle>
                        {canManageTeams && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Открыть меню</span>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/teams/${crew.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Подробнее
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditTeam(crew)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteCrew(crew.id, crew.name)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить команду
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Foreman */}
                      {crew.foreman && (
                        <div className="flex items-center space-x-3">
                          <Badge variant="default">Бригадир</Badge>
                          <div>
                            <div className="font-medium text-sm">{crew.foreman.full_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{crew.foreman.phone || "—"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Team Members */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Участники ({crew.member_count || 0})</span>
                        </div>
                        {crew.members?.length ? (
                          <div className="space-y-1">
                            {crew.members.slice(0, 3).map((member) => (
                              <div key={member.id} className="flex items-center justify-between text-sm">
                                <span>{member.user?.full_name || "Неизвестно"}</span>
                                <Badge variant={getRoleColor(member.user?.role || "")}>
                                  {member.user?.role || "—"}
                                </Badge>
                              </div>
                            ))}
                            {crew.members.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{crew.members.length - 3} ещё
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Нет назначенных участников</div>
                        )}
                      </div>

                      {/* Project Assignment */}
                      {crew.project_id && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>Назначен на проект {crew.project_id}</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/teams/${crew.id}`)}
                        >
                          <Eye className="mr-2 h-3 w-3" />
                          Просмотр
                        </Button>
                        {canManageTeams && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditTeam(crew)}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Изменить
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Свободные работники ({availableWorkers.length})
              </CardTitle>
              <CardDescription>
                Работники, доступные для назначения в команду (исключая уже назначенных)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-muted animate-pulse rounded flex-1" />
                      <div className="h-4 bg-muted animate-pulse rounded w-20" />
                    </div>
                  ))}
                </div>
              ) : availableWorkers.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Все работники назначены</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Все доступные работники уже назначены в команды. Проверьте вкладку «Все пользователи» для просмотра статуса назначений.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bulk Actions Toolbar */}
                  {selectedUsers.size > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Выбрано: {selectedUsers.size}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Изменить роль
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Назначить роль</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkAction("role_admin")}>
                              Администратор
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_pm")}>
                              Менеджер проекта
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_foreman")}>
                              Бригадир
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_crew")}>
                              Член бригады
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_viewer")}>
                              Наблюдатель
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBulkAction("delete")}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Удалить выбранных
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUsers(new Set())}
                        >
                          Снять выделение
                        </Button>
                      </div>
                    </div>
                  )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            selectedUsers.size > 0 &&
                            selectedUsers.size === availableWorkers.length
                          }
                          onCheckedChange={(checked) =>
                            handleSelectAllUsers(checked as boolean)
                          }
                          aria-label="Выбрать всех"
                        />
                      </TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>PIN-код</TableHead>
                      <TableHead>Навыки</TableHead>
                      <TableHead>Контакт</TableHead>
                      <TableHead className="w-[100px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableWorkers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleUserClick(user)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={(checked) =>
                              handleSelectUser(user.id, checked as boolean)
                            }
                            aria-label={`Select ${user.full_name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">
                            {user.pin_code ? (
                              <span className="bg-muted px-2 py-1 rounded text-xs">
                                {user.pin_code}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {user.skills && user.skills.length > 0 ? (
                              <>
                                {user.skills.slice(0, 2).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {user.skills.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{user.skills.length - 2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground text-sm">Нет навыков</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {canManageTeams && (
                            <AssignUserToTeamDialog
                              user={user}
                              teams={crews || []}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <UserPlus className="mr-2 h-3 w-3" />
                                Назначить
                              </Button>
                            </AssignUserToTeamDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-users" className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Фильтр пользователей</CardTitle>
              <CardDescription>
                Поиск по имени, email, роли, навыкам или команде
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени, email, роли, навыкам или команде..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Все пользователи ({filteredUsers.length} {searchQuery && `из ${users.length}`})
              </CardTitle>
              <CardDescription>
                Полный справочник пользователей со всеми ролями и возможностями управления
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-muted animate-pulse rounded flex-1" />
                      <div className="h-4 bg-muted animate-pulse rounded w-20" />
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Пользователи не найдены</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Начните с создания первой учётной записи.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bulk Actions Toolbar */}
                  {selectedUsers.size > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Выбрано: {selectedUsers.size}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Изменить роль
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Назначить роль</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkAction("role_admin")}>
                              Администратор
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_pm")}>
                              Менеджер проекта
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_foreman")}>
                              Бригадир
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_crew")}>
                              Член бригады
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_viewer")}>
                              Наблюдатель
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBulkAction("delete")}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Удалить выбранных
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUsers(new Set())}
                        >
                          Снять выделение
                        </Button>
                      </div>
                    </div>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={
                              selectedUsers.size > 0 &&
                              selectedUsers.size === filteredUsers.length
                            }
                            onCheckedChange={(checked) =>
                              handleSelectAllUsers(checked as boolean)
                            }
                            aria-label="Выбрать всех"
                          />
                        </TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>PIN-код</TableHead>
                        <TableHead>Навыки</TableHead>
                        <TableHead>Контакт</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Статус назначения</TableHead>
                        <TableHead className="w-[100px]">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleUserClick(user)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedUsers.has(user.id)}
                              onCheckedChange={(checked) =>
                                handleSelectUser(user.id, checked as boolean)
                              }
                              aria-label={`Select ${user.full_name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.full_name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono">
                              {user.pin_code ? (
                                <span className="bg-muted px-2 py-1 rounded text-xs">
                                  {user.pin_code}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {user.skills && user.skills.length > 0 ? (
                                <>
                                  {user.skills.slice(0, 2).map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {user.skills.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{user.skills.length - 2}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted-foreground text-sm">Нет навыков</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Активен" : "Неактивен"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isUserAssignedToTeam(user.id) ? (
                              <Badge variant="default" className="bg-green-600">
                                Назначен
                              </Badge>
                            ) : ["crew", "worker", "foreman"].includes(user.role) ? (
                              <Badge variant="outline">
                                Свободен
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Н/Д
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {canManageTeams && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Действия
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Действия с пользователем</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUserClick(user);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Подробнее
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditUser(user);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Редактировать
                                  </DropdownMenuItem>
                                  {["crew", "worker", "foreman"].includes(user.role) && !isUserAssignedToTeam(user.id) && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUserToAssign(user);
                                        setShowAssignUserDialog(true);
                                      }}
                                    >
                                      <UserPlus className="mr-2 h-4 w-4" />
                                      Назначить в команду
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteUser(user);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Удалить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего команд</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{crews?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Активные бригады
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего работников</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {crews?.reduce((sum, crew) => sum + (crew.member_count || 0), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Назначено в команды
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Свободные работники</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableWorkers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Не назначены в команды
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активные проекты</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(crews?.filter(c => c.project_id).map(c => c.project_id)).size || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  С назначенными командами
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Обзор производительности команд</CardTitle>
              <CardDescription>
                Анализ продуктивности и загруженности команд
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills Distribution */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Распределение навыков по командам</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(() => {
                    // Calculate skills distribution from all users
                    const skillsCount: Record<string, number> = {};
                    users.forEach(user => {
                      if (user.skills && Array.isArray(user.skills)) {
                        user.skills.forEach(skill => {
                          skillsCount[skill] = (skillsCount[skill] || 0) + 1;
                        });
                      }
                    });

                    const topSkills = Object.entries(skillsCount)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6);

                    return topSkills.map(([skill, count]) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill}</span>
                          <span className="text-muted-foreground">{count} работников</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min((count / users.length) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Role Distribution */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Распределение по ролям</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {(() => {
                    const roles = ['admin', 'pm', 'foreman', 'crew', 'viewer'];
                    const roleColors = {
                      admin: 'bg-red-500',
                      pm: 'bg-blue-500',
                      foreman: 'bg-green-500',
                      crew: 'bg-yellow-500',
                      viewer: 'bg-gray-500'
                    };

                    return roles.map(role => {
                      const count = users.filter(user => user.role === role).length;
                      const percentage = users.length > 0 ? (count / users.length) * 100 : 0;

                      return (
                        <div key={role} className="text-center space-y-2">
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground capitalize">{role}</div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${roleColors[role as keyof typeof roleColors]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Team Assignment Status */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Статус назначения команд</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {crews?.reduce((sum, crew) => sum + (crew.member_count || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Назначенные работники</div>
                        <div className="text-xs text-green-600 mt-1">
                          {crews?.length || 0} активных бригад
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {availableWorkers.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Свободные работники</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Готовы к назначению
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {(() => {
                            const assignedWorkers = crews?.reduce((sum, crew) => sum + (crew.member_count || 0), 0) || 0;
                            const totalWorkers = users.filter(u => ['crew', 'worker', 'foreman'].includes(u.role)).length;
                            return totalWorkers > 0 ? Math.round((assignedWorkers / totalWorkers) * 100) : 0;
                          })()}%
                        </div>
                        <div className="text-sm text-muted-foreground">Коэффициент загрузки</div>
                        <div className="text-xs text-purple-600 mt-1">
                          Эффективность команды
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activity Summary */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Последняя активность команд</h4>
                <div className="space-y-3">
                  {crews && crews.length > 0 ? (
                    crews.slice(0, 5).map((crew) => (
                      <div key={crew.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-sm">{crew.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {crew.member_count || 0} чел. • Бригадир: {crew.foreman?.full_name || "Не назначен"}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Активна
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Нет активности для отображения
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Добавить нового сотрудника</DialogTitle>
            <DialogDescription>
              Создание учётной записи сотрудника с автоматической генерацией PIN-кода и управлением навыками. Можно выбрать любую роль и назначить в команду позже.
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm
            onSuccess={handleUserCreated}
            onCancel={() => setShowCreateUserDialog(false)}
            defaultRole={defaultUserRole}
          />
        </DialogContent>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Создать новую бригаду</DialogTitle>
            <DialogDescription>
              Создание рабочей бригады с названием и опциональным назначением бригадира.
            </DialogDescription>
          </DialogHeader>
          <Form {...createTeamForm}>
            <form onSubmit={createTeamForm.handleSubmit(handleCreateTeam)} className="space-y-4">
              <FormField
                control={createTeamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название бригады *</FormLabel>
                    <FormControl>
                      <Input placeholder="напр., Бригада Альфа, Кабельная бригада 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createTeamForm.control}
                name="foreman_user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бригадир (опционально)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите бригадира..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Бригадир не назначен</SelectItem>
                        {foremenUsers?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createTeamForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (опционально)</FormLabel>
                    <FormControl>
                      <Input placeholder="Специализация или заметки о бригаде..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateTeamDialog(false);
                    createTeamForm.reset();
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={createTeam.isPending}>
                  {createTeam.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Создать бригаду
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={showEditTeamDialog} onOpenChange={setShowEditTeamDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать бригаду</DialogTitle>
            <DialogDescription>
              Обновление информации и назначений бригады.
            </DialogDescription>
          </DialogHeader>
          <Form {...editTeamForm}>
            <form onSubmit={editTeamForm.handleSubmit(handleUpdateTeam)} className="space-y-4">
              <FormField
                control={editTeamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название бригады *</FormLabel>
                    <FormControl>
                      <Input placeholder="напр., Бригада Альфа, Кабельная бригада 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editTeamForm.control}
                name="foreman_user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бригадир</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите бригадира..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Бригадир не назначен</SelectItem>
                        {foremenUsers?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editTeamForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Input placeholder="Специализация или заметки о бригаде..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditTeamDialog(false);
                    setEditingTeam(null);
                    editTeamForm.reset();
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={updateTeam.isPending}>
                  {updateTeam.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  ) : (
                    <Edit className="mr-2 h-4 w-4" />
                  )}
                  Сохранить
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetailDialog} onOpenChange={setShowUserDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Информация о сотруднике - {selectedUser?.full_name}
            </DialogTitle>
            <DialogDescription>
              Полная информация о профиле, навыках и опциях управления
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-6 py-4">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Личная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">ФИО</label>
                    <div className="text-sm">{selectedUser.full_name}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="text-sm flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {selectedUser.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Телефон</label>
                    <div className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedUser.phone || "—"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Язык интерфейса</label>
                    <div className="text-sm flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      {selectedUser.lang_pref || "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Доступ к системе
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Роль</label>
                    <Badge variant={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">PIN-код</label>
                    <div className="text-sm font-mono flex items-center gap-2">
                      <Code className="h-3 w-3" />
                      {selectedUser.pin_code ? (
                        <span className="bg-muted px-2 py-1 rounded">
                          {selectedUser.pin_code}
                        </span>
                      ) : "—"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Дата создания</label>
                    <div className="text-sm flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('ru-RU') : "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Навыки и компетенции</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser.skills && selectedUser.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Навыки не указаны</div>
                  )}
                </CardContent>
              </Card>

              {/* Documents Section */}
              <UserDocumentsSummary userId={selectedUser.id} />

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {canManageTeams && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditUser(selectedUser)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Редактировать
                    </Button>
                    <WorkerDocumentsDialog
                      userId={selectedUser.id}
                      userName={`${selectedUser.first_name} ${selectedUser.last_name}`}
                      trigger={
                        <Button variant="outline" className="flex-1">
                          <FileText className="mr-2 h-4 w-4" />
                          Документы
                        </Button>
                      }
                    />
                    {["crew", "worker", "foreman"].includes(selectedUser.role) && !isUserAssignedToTeam(selectedUser.id) && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserToAssign(selectedUser);
                          setShowAssignUserDialog(true);
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Назначить в бригаду
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(selectedUser)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowUserDetailDialog(false)}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование - {editingUser?.full_name}</DialogTitle>
            <DialogDescription>
              Обновление информации, роли и навыков пользователя. Изменения сохраняются немедленно.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <CreateUserForm
              onSuccess={() => {
                setShowEditUserDialog(false);
                setEditingUser(null);
              }}
              onCancel={() => {
                setShowEditUserDialog(false);
                setEditingUser(null);
              }}
              defaultRole={editingUser.role}
              editMode={true}
              initialData={editingUser}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Удаление пользователя
            </DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="font-medium">{selectedUser.full_name}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                  {selectedUser.pin_code && (
                    <span className="text-xs bg-muted-foreground/20 px-2 py-1 rounded font-mono">
                      PIN: {selectedUser.pin_code}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="text-sm text-destructive font-medium">⚠️ Внимание</div>
                <div className="text-sm text-destructive/80 mt-1">
                  Это действие безвозвратно удалит учётную запись пользователя и уберёт его из всех бригад.
                  Связанные рабочие записи и документы останутся, но больше не будут привязаны к этому пользователю.
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteUserDialog(false);
                setSelectedUser(null);
              }}
              disabled={deleteUser.isPending}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Удаление...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить пользователя
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Confirmation Dialog */}
      <Dialog open={showBulkActionsDialog} onOpenChange={setShowBulkActionsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Подтверждение массового действия
            </DialogTitle>
            <DialogDescription>
              {bulkAction === "delete"
                ? `Вы уверены, что хотите удалить ${selectedUsers.size} пользовател${
                    selectedUsers.size === 1 ? "я" : selectedUsers.size < 5 ? "ей" : "ей"
                  }? Это действие нельзя отменить.`
                : bulkAction.startsWith("role_")
                ? `Вы уверены, что хотите изменить роль ${selectedUsers.size} пользовател${
                    selectedUsers.size === 1 ? "я" : "ей"
                  } на ${bulkAction.replace("role_", "")}?`
                : "Пожалуйста, подтвердите это массовое действие."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="font-medium">
                Выбранные пользователи ({selectedUsers.size}):
              </div>
              <div className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                {Array.from(selectedUsers).map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return user ? (
                    <div key={userId} className="flex items-center gap-2">
                      <span>{user.full_name}</span>
                      <Badge variant={getRoleColor(user.role)} className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {bulkAction === "delete" && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="text-sm text-destructive font-medium">⚠️ Внимание</div>
                <div className="text-sm text-destructive/80 mt-1">
                  Это действие безвозвратно удалит выбранных пользователей и уберёт их из всех бригад.
                  Связанные рабочие записи и документы останутся, но больше не будут привязаны к этим пользователям.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkActionsDialog(false);
                setBulkAction("");
              }}
              disabled={updateUser.isPending || deleteUser.isPending}
            >
              Отмена
            </Button>
            <Button
              variant={bulkAction === "delete" ? "destructive" : "default"}
              onClick={confirmBulkAction}
              disabled={updateUser.isPending || deleteUser.isPending}
            >
              {updateUser.isPending || deleteUser.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Обработка...
                </>
              ) : bulkAction === "delete" ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить пользователей
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Изменить роли
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign User to Team Dialog */}
      {userToAssign && (
        <AssignUserToTeamDialog
          user={userToAssign}
          teams={crews || []}
          open={showAssignUserDialog}
          onOpenChange={(open) => {
            setShowAssignUserDialog(open);
            if (!open) {
              setUserToAssign(null);
            }
          }}
        />
      )}
    </div>
  );
}