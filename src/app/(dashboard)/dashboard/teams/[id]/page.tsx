"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Users,
  Edit,
  Save,
  X,
  MapPin,
  Calendar,
  Mail,
  Phone,
  UserPlus,
  Trash2,
  Settings,
  Wrench,
  Truck,
  Package
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useCrew, useUpdateCrew, useDeleteCrew } from "@/hooks/use-teams";
import { useUsers } from "@/hooks/use-users";
import { useProjects } from "@/hooks/use-projects";
import { usePermissions } from "@/hooks/use-auth";
import { useCrewEquipmentAssignments } from "@/hooks/use-equipment";
import { useCrewVehicleAssignments } from "@/hooks/use-vehicles";
import WorkerDocumentsDialog from "@/components/documents/worker-documents-dialog";

// Validation schema for editing teams
const editTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  foreman_user_id: z.string().optional(),
  project_id: z.string().optional(),
});

type EditTeamFormData = z.infer<typeof editTeamSchema>;

export default function TeamDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { canManageTeams } = usePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const teamId = params.id as string;
  const { data: crew, isLoading: crewLoading, error } = useCrew(teamId);
  const updateCrew = useUpdateCrew();
  const deleteCrew = useDeleteCrew();

  const { data: usersResponse } = useUsers({
    page: 1,
    per_page: 100
  });
  const { data: projectsResponse, isLoading: projectsLoading } = useProjects({
    page: 1,
    per_page: 50
  });

  // Fetch crew assignments
  const { data: equipmentAssignments, isLoading: equipmentLoading } = useCrewEquipmentAssignments(teamId);
  const { data: vehicleAssignments, isLoading: vehicleLoading } = useCrewVehicleAssignments(teamId);

  const users = usersResponse?.items || [];
  const projects = projectsResponse?.items || [];
  const foremen = users.filter(user => ["foreman", "pm", "admin"].includes(user.role));

  const editTeamForm = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: crew?.name || "",
      foreman_user_id: crew?.foreman_user_id || "",
      project_id: crew?.project_id || "",
    },
  });

  // Update form when crew data loads
  useEffect(() => {
    if (crew) {
      editTeamForm.reset({
        name: crew.name,
        foreman_user_id: crew.foreman_user_id || "",
        project_id: crew.project_id || "",
      });
    }
  }, [crew, editTeamForm]);

  const handleUpdateTeam = async (data: EditTeamFormData) => {
    if (!crew) return;

    try {
      const teamData = {
        name: data.name,
        foreman_user_id: data.foreman_user_id === "none" ? undefined : data.foreman_user_id,
        project_id: data.project_id === "none" ? undefined : data.project_id,
      };

      await updateCrew.mutateAsync({ id: crew.id, data: teamData });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update team:", error);
    }
  };

  const handleDeleteTeam = async () => {
    if (!crew) return;

    try {
      await deleteCrew.mutateAsync(crew.id);
      router.push("/dashboard/teams");
    } catch (error) {
      console.error("Failed to delete team:", error);
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

  if (crewLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          <div>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 mt-2 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-destructive">Team Not Found</h1>
            <p className="text-muted-foreground">
              The team you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{crew.name}</h1>
            <p className="text-muted-foreground">
              Team details and member management
            </p>
          </div>
        </div>
        {canManageTeams && (
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Team</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Team</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{crew.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTeam}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Team Information</span>
            </CardTitle>
            <CardDescription>
              Basic team details and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Team Name</Label>
                  <p className="text-lg">{crew.name}</p>
                </div>

                {crew.foreman && (
                  <div>
                    <Label className="text-sm font-medium">Team Leader / Foreman</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="default">{crew.foreman.role}</Badge>
                      <span className="text-sm">{crew.foreman.full_name}</span>
                    </div>
                    {crew.foreman.email && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{crew.foreman.email}</span>
                      </div>
                    )}
                    {crew.foreman.phone && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{crew.foreman.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {crew.project_name && (
                  <div>
                    <Label className="text-sm font-medium">Assigned Project</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{crew.project_name}</span>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">{crew.status}</Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(crew.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <Form {...editTeamForm}>
                <form onSubmit={editTeamForm.handleSubmit(handleUpdateTeam)} className="space-y-4">
                  <FormField
                    control={editTeamForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Installation Team Alpha"
                            {...field}
                          />
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
                        <FormLabel>Team Leader / Foreman</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team leader" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No leader assigned</SelectItem>
                            {foremen.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.full_name} ({user.role})
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
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Project</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No project assigned</SelectItem>
                            {projectsLoading ? (
                              <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                            ) : (
                              projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateCrew.isPending}>
                      {updateCrew.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Team Members ({crew.members?.length || 0})</span>
                </CardTitle>
                <CardDescription>
                  Current team members and their roles
                </CardDescription>
              </div>
              {canManageTeams && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/teams/${teamId}/members`)}
                  className="flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Manage Members</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {crew.members?.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No team members</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This team doesn't have any members assigned yet.
                  </p>
                  {canManageTeams && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push(`/dashboard/teams/${teamId}/members`)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Members
                    </Button>
                  )}
                </div>
              ) : (
                crew.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{member.user.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {member.user.email || member.user.phone || "No contact info"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleColor(member.user.role || "")}>
                        {member.user.role}
                      </Badge>
                      <Badge variant="outline">
                        {member.role_in_crew}
                      </Badge>
                      <WorkerDocumentsDialog
                        userId={member.user.id}
                        userName={member.user.full_name}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Resources - Full Width Section */}
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Assigned Resources</span>
                </CardTitle>
                <CardDescription>
                  Equipment and vehicles assigned to this crew
                </CardDescription>
              </div>
              {canManageTeams && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/equipment/assignments/new')}
                  className="flex items-center space-x-2"
                >
                  <Package className="h-4 w-4" />
                  <span>Assign Resource</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Equipment Section */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Wrench className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">Equipment ({equipmentAssignments?.length || 0})</span>
                </div>
                {equipmentLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : !equipmentAssignments?.length ? (
                  <div className="text-center py-6 border rounded-lg bg-muted/10">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No equipment assigned</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {equipmentAssignments?.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Wrench className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {assignment.equipment?.name || 'Unknown Equipment'}
                            </div>
                            {assignment.equipment?.inventory_no && (
                              <div className="text-sm text-muted-foreground">
                                #{assignment.equipment.inventory_no}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {assignment.is_permanent ? 'Permanent' : 'Temporary'}
                          </div>
                          {assignment.project_name && (
                            <div className="text-xs text-muted-foreground">
                              Project: {assignment.project_name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vehicle Section */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">Vehicles ({vehicleAssignments?.length || 0})</span>
                </div>
                {vehicleLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : !vehicleAssignments?.length ? (
                  <div className="text-center py-6 border rounded-lg bg-muted/10">
                    <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No vehicles assigned</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicleAssignments?.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {assignment.vehicle?.brand} {assignment.vehicle?.model}
                            </div>
                            {assignment.vehicle?.plate_number && (
                              <div className="text-sm text-muted-foreground">
                                🚗 {assignment.vehicle.plate_number} • {assignment.vehicle.type}
                              </div>
                            )}
                            {assignment.vehicle?.tipper_type && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Badge variant="outline" className={assignment.vehicle.tipper_type === 'Kipper' ? 'bg-orange-100 text-orange-800 border-orange-200 text-xs' : 'bg-gray-100 text-gray-800 border-gray-200 text-xs'}>
                                  {assignment.vehicle.tipper_type}
                                </Badge>
                                {assignment.vehicle.max_weight_kg && (
                                  <span>• Max: {assignment.vehicle.max_weight_kg} kg</span>
                                )}
                              </div>
                            )}
                            {assignment.vehicle?.comment && (
                              <div className="text-xs text-muted-foreground italic mt-1">
                                {assignment.vehicle.comment}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {assignment.is_permanent ? 'Permanent' : 'Temporary'}
                          </div>
                          {assignment.project_name && (
                            <div className="text-xs text-muted-foreground">
                              Project: {assignment.project_name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}