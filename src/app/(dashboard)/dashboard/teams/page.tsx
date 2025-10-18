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
import { useQueryClient } from "@tanstack/react-query";
import WorkerDocumentsDialog from "@/components/documents/worker-documents-dialog";
import { usePermissions } from "@/hooks/use-auth";
import CreateUserForm from "@/components/features/user-management/create-user-form";
import AssignUserToTeamDialog from "@/components/teams/assign-user-to-team-dialog";


// Validation schema for creating/editing teams
const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  foreman_user_id: z.string().optional(),
  project_id: z.string().optional(),
  description: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

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
    if (confirm(`Are you sure you want to delete "${crewName}"? This action cannot be undone.`)) {
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
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Failed to load teams. Please try again later.
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
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Manage work crews and team assignments
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
              Add Team Member
            </Button>
            <Button onClick={() => setShowCreateTeamDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Team
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="crews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="crews">Work Crews ({crews?.length || 0})</TabsTrigger>
          <TabsTrigger value="available">Available Workers ({availableWorkers.length})</TabsTrigger>
          <TabsTrigger value="all-users">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="crews" className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Teams</CardTitle>
              <CardDescription>
                Search teams by name or foreman
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams by name, foreman, or project..."
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
                      <h3 className="mt-2 text-sm font-semibold">No teams found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Get started by creating your first work crew.
                      </p>
                      {canManageTeams && (
                        <Button
                          className="mt-4"
                          onClick={() => router.push("/dashboard/teams/new")}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Team
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
                                <span className="sr-only">Open menu</span>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/teams/${crew.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditTeam(crew)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Team
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteCrew(crew.id, crew.name)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Team
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
                          <Badge variant="default">Foreman</Badge>
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
                          <span>Team Members ({crew.member_count || 0})</span>
                        </div>
                        {crew.members?.length ? (
                          <div className="space-y-1">
                            {crew.members.slice(0, 3).map((member) => (
                              <div key={member.id} className="flex items-center justify-between text-sm">
                                <span>{member.user?.full_name || "Unknown"}</span>
                                <Badge variant={getRoleColor(member.user?.role || "")}>
                                  {member.user?.role || "—"}
                                </Badge>
                              </div>
                            ))}
                            {crew.members.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{crew.members.length - 3} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No members assigned</div>
                        )}
                      </div>

                      {/* Project Assignment */}
                      {crew.project_id && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>Assigned to Project {crew.project_id}</span>
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
                          View
                        </Button>
                        {canManageTeams && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditTeam(crew)}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
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
                Available Workers ({availableWorkers.length})
              </CardTitle>
              <CardDescription>
                Workers available for team assignment (excludes already assigned workers)
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
                  <h3 className="mt-2 text-sm font-semibold">All workers assigned</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All available workers are currently assigned to teams. Check the "All Users" tab to see assignment status.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bulk Actions Toolbar */}
                  {selectedUsers.size > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Change Role
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Assign Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkAction("role_admin")}>
                              Administrator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_pm")}>
                              Project Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_foreman")}>
                              Foreman
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_crew")}>
                              Crew Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_viewer")}>
                              Viewer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBulkAction("delete")}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Selected
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUsers(new Set())}
                        >
                          Clear Selection
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
                          aria-label="Select all users"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>PIN Code</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
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
                              <span className="text-muted-foreground text-sm">No skills</span>
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
                                Assign
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
              <CardTitle>Filter Users</CardTitle>
              <CardDescription>
                Search users by name, email, role, skills, or team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, role, skills, or team..."
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
                All Users ({filteredUsers.length} {searchQuery && `of ${users.length}`})
              </CardTitle>
              <CardDescription>
                Complete user directory with all roles and management capabilities
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
                  <h3 className="mt-2 text-sm font-semibold">No users found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by creating your first user account.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bulk Actions Toolbar */}
                  {selectedUsers.size > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Change Role
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Assign Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkAction("role_admin")}>
                              Administrator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_pm")}>
                              Project Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_foreman")}>
                              Foreman
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_crew")}>
                              Crew Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction("role_viewer")}>
                              Viewer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBulkAction("delete")}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Selected
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUsers(new Set())}
                        >
                          Clear Selection
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
                            aria-label="Select all users"
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>PIN Code</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Team Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
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
                                <span className="text-muted-foreground text-sm">No skills</span>
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
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {isUserAssignedToTeam(user.id) ? (
                              <Badge variant="default" className="bg-green-600">
                                Assigned
                              </Badge>
                            ) : ["crew", "worker", "foreman"].includes(user.role) ? (
                              <Badge variant="outline">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                N/A
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
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUserClick(user);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditUser(user);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit User
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
                                      Assign to Team
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
                                    Delete User
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
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{crews?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active work crews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {crews?.reduce((sum, crew) => sum + (crew.member_count || 0), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Assigned to teams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Workers</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableWorkers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Not assigned to teams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(crews?.filter(c => c.project_id).map(c => c.project_id)).size || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  With assigned teams
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance Overview</CardTitle>
              <CardDescription>
                Team productivity and workload analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills Distribution */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Skills Distribution Across Teams</h4>
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
                          <span className="text-muted-foreground">{count} workers</span>
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
                <h4 className="text-sm font-medium">Role Distribution</h4>
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
                <h4 className="text-sm font-medium">Team Assignment Status</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {crews?.reduce((sum, crew) => sum + (crew.member_count || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Assigned Workers</div>
                        <div className="text-xs text-green-600 mt-1">
                          {crews?.length || 0} active teams
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
                        <div className="text-sm text-muted-foreground">Available Workers</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Ready for assignment
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
                        <div className="text-sm text-muted-foreground">Utilization Rate</div>
                        <div className="text-xs text-purple-600 mt-1">
                          Team efficiency
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activity Summary */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Recent Team Activities</h4>
                <div className="space-y-3">
                  {crews && crews.length > 0 ? (
                    crews.slice(0, 5).map((crew) => (
                      <div key={crew.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium text-sm">{crew.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {crew.member_count || 0} members • Foreman: {crew.foreman?.full_name || "Not assigned"}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No team activities to display
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
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Create a new team member account with automatic PIN generation and skills management. You can select any role and assign them to teams later.
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
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new work crew/team with a name and optional foreman assignment.
            </DialogDescription>
          </DialogHeader>
          <Form {...createTeamForm}>
            <form onSubmit={createTeamForm.handleSubmit(handleCreateTeam)} className="space-y-4">
              <FormField
                control={createTeamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alpha Team, Fiber Crew 1" {...field} />
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
                    <FormLabel>Foreman (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select foreman..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No foreman assigned</SelectItem>
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Team specialization or notes..." {...field} />
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
                  Cancel
                </Button>
                <Button type="submit" disabled={createTeam.isPending}>
                  {createTeam.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create Team
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
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information and assignments.
            </DialogDescription>
          </DialogHeader>
          <Form {...editTeamForm}>
            <form onSubmit={editTeamForm.handleSubmit(handleUpdateTeam)} className="space-y-4">
              <FormField
                control={editTeamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alpha Team, Fiber Crew 1" {...field} />
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
                    <FormLabel>Foreman</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select foreman..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No foreman assigned</SelectItem>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Team specialization or notes..." {...field} />
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
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTeam.isPending}>
                  {updateTeam.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  ) : (
                    <Edit className="mr-2 h-4 w-4" />
                  )}
                  Update Team
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
              User Details - {selectedUser?.full_name}
            </DialogTitle>
            <DialogDescription>
              Complete user profile information, skills, and management options
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-6 py-4">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
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
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedUser.phone || "—"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Language Preference</label>
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
                    System Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <Badge variant={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">PIN Code</label>
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
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="text-sm flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Competencies</CardTitle>
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
                    <div className="text-sm text-muted-foreground">No skills assigned</div>
                  )}
                </CardContent>
              </Card>

              {/* Documents Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </CardTitle>
                  <CardDescription>
                    User documents, contracts, and certifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>Document management integration will be implemented</p>
                    <p className="text-xs mt-2">This will connect to the existing document system</p>
                  </div>
                </CardContent>
              </Card>

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
                      Edit User
                    </Button>
                    <WorkerDocumentsDialog
                      userId={selectedUser.id}
                      userName={`${selectedUser.first_name} ${selectedUser.last_name}`}
                      trigger={
                        <Button variant="outline" className="flex-1">
                          <FileText className="mr-2 h-4 w-4" />
                          Manage Documents
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
                        Assign to Team
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(selectedUser)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowUserDetailDialog(false)}
                >
                  Close
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
            <DialogTitle>Edit User - {editingUser?.full_name}</DialogTitle>
            <DialogDescription>
              Update user information, role, and skills. Changes will be saved immediately.
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
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
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
                <div className="text-sm text-destructive font-medium">⚠️ Warning</div>
                <div className="text-sm text-destructive/80 mt-1">
                  This will permanently delete the user account and remove them from all teams.
                  Any associated work entries and documents will remain but will no longer be linked to this user.
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
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
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
              Confirm Bulk Action
            </DialogTitle>
            <DialogDescription>
              {bulkAction === "delete"
                ? `Are you sure you want to delete ${selectedUsers.size} user${
                    selectedUsers.size > 1 ? "s" : ""
                  }? This action cannot be undone.`
                : bulkAction.startsWith("role_")
                ? `Are you sure you want to change the role of ${selectedUsers.size} user${
                    selectedUsers.size > 1 ? "s" : ""
                  } to ${bulkAction.replace("role_", "")}?`
                : "Please confirm this bulk action."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="font-medium">
                Selected Users ({selectedUsers.size}):
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
                <div className="text-sm text-destructive font-medium">⚠️ Warning</div>
                <div className="text-sm text-destructive/80 mt-1">
                  This will permanently delete the selected users and remove them from all teams.
                  Any associated work entries and documents will remain but will no longer be linked to these users.
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
              Cancel
            </Button>
            <Button
              variant={bulkAction === "delete" ? "destructive" : "default"}
              onClick={confirmBulkAction}
              disabled={updateUser.isPending || deleteUser.isPending}
            >
              {updateUser.isPending || deleteUser.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Processing...
                </>
              ) : bulkAction === "delete" ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Users
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Update Roles
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