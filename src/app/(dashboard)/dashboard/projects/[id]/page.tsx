"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Users, TrendingUp, AlertTriangle, Building2, Phone, Globe, Settings, FileText, CheckCircle, Download, Eye, User, Mail, Shield, Wrench, Truck, HardHat, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useProject, useProjectStats, useDeleteProject } from "@/hooks/use-projects";
import { usePermissions, getStoredToken } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useProjectPreparation } from "@/hooks/use-project-preparation";
import ProjectPreparationTab from "@/components/project-preparation/project-preparation-tab";
import ProjectSoilTypesCard from "@/components/project-soil-types-card";
import ProjectContactsCard from "@/components/project-contacts-card";
import type { ProjectStatus } from "@/types";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { canManageProjects } = usePermissions();

  const projectId = params.id as string;
  const { data: project, isLoading, error } = useProject(projectId);
  const { data: preparation } = useProjectPreparation(projectId);
  const { data: stats, isLoading: statsLoading } = useProjectStats(projectId);
  const deleteProject = useDeleteProject();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<any>(null);

  // Fetch team data
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['project-team', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/team`);
      if (!response.ok) throw new Error('Failed to fetch team data');
      return response.json();
    },
    enabled: !!projectId,
  });

  // Fetch documents data
  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents data');
      return response.json();
    },
    enabled: !!projectId,
  });

  // Fetch project resources (equipment and vehicles assigned to project crews)
  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['project-resources', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/resources`);
      if (!response.ok) throw new Error('Failed to fetch project resources');
      return response.json();
    },
    enabled: !!projectId,
  });

  // Fetch soil types to calculate real project value
  const { data: soilTypesData } = useQuery({
    queryKey: ['project-soil-types', projectId],
    queryFn: async () => {
      const token = getStoredToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`/api/projects/${projectId}/soil-types`, { headers });
      if (!response.ok) throw new Error('Failed to fetch soil types');
      return response.json();
    },
    enabled: !!projectId,
  });

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "draft":
        return "secondary";
      case "waiting_invoice":
        return "outline";
      case "closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case "active":
        return "Active";
      case "draft":
        return "Draft";
      case "waiting_invoice":
        return "Waiting Invoice";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // Calculate real project value from soil types or use simple calculation
  const calculateProjectValue = () => {
    // If soil types exist, use them for accurate calculation
    if (soilTypesData && Array.isArray(soilTypesData) && soilTypesData.length > 0) {
      const totalValue = soilTypesData.reduce((sum: number, soilType: any) => {
        const quantity = parseFloat(soilType.quantity_meters || 0);
        const price = parseFloat(soilType.price_per_meter || 0);
        return sum + (quantity * price);
      }, 0);
      return totalValue;
    }

    // Fallback to simple calculation if no soil types
    return project.total_length_m * project.base_rate_per_m;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Project not found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use real data from API or fallback to defaults
  const progressData = stats?.progress || {
    totalLength: project.total_length_m,
    completedLength: 0,
    progressPercentage: 0,
    workEntries: 0,
    pendingApprovals: 0,
    teamMembers: 0,
    materialsCount: 0,
  };

  const phaseData = stats?.phase || {
    currentPhase: 1,
    totalPhases: 10,
    phaseName: "Project Initiation",
    phaseProgress: 0,
  };

  const financialData = stats?.financial || {
    projectBudget: (project.total_length_m * (project.base_rate_per_m || 0)),
    totalSpent: 0,
    spentPercentage: 0,
    remainingBudget: (project.total_length_m * (project.base_rate_per_m || 0)),
  };

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
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Project Details • {project.total_length_m}m fiber installation
            </p>
          </div>
        </div>
        {canManageProjects && (
          <div className="flex gap-2">
            <Button onClick={() => router.push(`/dashboard/projects/${project.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </Button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-2 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{progressData.progressPercentage}%</div>
                <Progress value={progressData.progressPercentage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {progressData.completedLength}m of {progressData.totalLength}m completed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Entries</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{progressData.workEntries}</div>
                <p className="text-xs text-muted-foreground">
                  {progressData.pendingApprovals} pending approval
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{progressData.teamMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Active on this project
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-3 w-28 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{phaseData.currentPhase}/{phaseData.totalPhases}</div>
                <p className="text-xs text-muted-foreground">
                  {phaseData.phaseName}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preparation" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preparation
            {preparation && (
              <Badge variant="outline" className="text-xs">
                {preparation.preparation_progress}%
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="team">Resources</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Basic details and specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                    <p className="text-sm">{project.customer || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Project Manager</p>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm">
                        {project.manager_name || project.manager?.full_name || "Not assigned"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm">{project.city || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Length</p>
                    <p className="text-sm font-mono">{project.total_length_m} meters</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rate per Meter</p>
                    <p className="text-sm font-mono">€{project.base_rate_per_m}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Project Value</p>
                    <p className="text-sm font-mono font-semibold">
                      €{calculateProjectValue().toLocaleString('de-DE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Language</p>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm">{project.language_default?.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {project.address && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-sm">{project.address}</p>
                  </div>
                )}

                {project.contact_24h && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">24h Contact</p>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm">{project.contact_24h}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Important dates and milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.start_date && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Start Date</span>
                    </div>
                    <span className="text-sm">
                      {new Date(project.start_date).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {project.end_date_plan && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Planned End</span>
                    </div>
                    <span className="text-sm">
                      {new Date(project.end_date_plan).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {project.start_date && project.end_date_plan && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Duration</span>
                      <span className="text-sm">
                        {Math.ceil(
                          (new Date(project.end_date_plan).getTime() - new Date(project.start_date).getTime()) /
                          (1000 * 60 * 60 * 24)
                        )} days
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Soil Types Section */}
          <ProjectSoilTypesCard projectId={projectId} />

          {/* Project Contacts Section */}
          <ProjectContactsCard projectId={projectId} />
        </TabsContent>

        <TabsContent value="preparation" className="space-y-6">
          <ProjectPreparationTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress Overview</CardTitle>
              <CardDescription>
                Track progress across different aspects of the project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{progressData.progressPercentage}%</span>
                  </div>
                  <Progress value={progressData.progressPercentage} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Phase Progress</span>
                    <span className="text-sm text-muted-foreground">{phaseData.phaseProgress}%</span>
                  </div>
                  <Progress value={phaseData.phaseProgress} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Phase {phaseData.currentPhase}: {phaseData.phaseName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resources Overview</CardTitle>
              <CardDescription>
                Team members, equipment and transport assigned to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="skeleton h-4 w-4 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="skeleton h-4 w-full" />
                      <div className="skeleton h-3 w-3/4" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="skeleton h-4 w-4 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="skeleton h-4 w-full" />
                      <div className="skeleton h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              ) : teamData?.crews?.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{teamData.summary.total_crews}</div>
                      <div className="text-sm text-muted-foreground">Total Crews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{teamData.summary.total_members}</div>
                      <div className="text-sm text-muted-foreground">Team Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{teamData.summary.foreman_count}</div>
                      <div className="text-sm text-muted-foreground">Foremen</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{teamData.summary.worker_count}</div>
                      <div className="text-sm text-muted-foreground">Workers</div>
                    </div>
                  </div>

                  {/* Crews */}
                  <div className="space-y-4">
                    {teamData.crews.map((crew: any) => (
                      <Card key={crew.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{crew.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {crew.member_count} members • Status: {crew.status}
                              </p>
                            </div>
                            <Badge variant={crew.status === 'active' ? 'default' : 'secondary'}>
                              {crew.status}
                            </Badge>
                          </div>

                          {/* Foreman */}
                          {crew.foreman && (
                            <div className="border-l-2 border-primary pl-4">
                              <div className="flex items-center space-x-3">
                                <Shield className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium">{crew.foreman.full_name}</div>
                                  <div className="text-sm text-muted-foreground flex items-center space-x-2">
                                    {crew.foreman.email && (
                                      <>
                                        <Mail className="h-3 w-3" />
                                        <span>{crew.foreman.email}</span>
                                      </>
                                    )}
                                    {crew.foreman.phone && (
                                      <>
                                        <span>•</span>
                                        <Phone className="h-3 w-3" />
                                        <span>{crew.foreman.phone}</span>
                                      </>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Foreman
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Members */}
                          {crew.members && crew.members.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-muted-foreground">Team Members</h5>
                              <div className="grid gap-2">
                                {crew.members.map((member: any) => (
                                  <div key={member.id} className="flex items-center space-x-3 py-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                      <div className="font-medium">{member.user.full_name}</div>
                                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                                        {member.user.email && (
                                          <>
                                            <Mail className="h-3 w-3" />
                                            <span>{member.user.email}</span>
                                          </>
                                        )}
                                        {member.user.phone && (
                                          <>
                                            <span>•</span>
                                            <Phone className="h-3 w-3" />
                                            <span>{member.user.phone}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {member.role_in_crew}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No teams assigned to this project yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resource Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Resource Summary
              </CardTitle>
              <CardDescription>
                Overview of all resources assigned to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resourcesLoading ? (
                <div className="text-center py-4">Loading resources...</div>
              ) : resourcesData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {(resourcesData?.equipment?.length || 0) + (resourcesData?.vehicles?.length || 0) + (resourcesData?.materials?.length || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Resources</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{resourcesData?.equipment?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Equipment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{resourcesData?.vehicles?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Vehicles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      €{(
                        (resourcesData?.equipment?.reduce((sum: number, eq: any) => sum + (eq.rental_cost_per_day || 0), 0) || 0) +
                        (resourcesData?.vehicles?.reduce((sum: number, vh: any) => sum + (vh.rental_cost_per_day || 0), 0) || 0)
                      ).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No resource data available</div>
              )}
            </CardContent>
          </Card>

          {/* Equipment & Transport Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Equipment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Equipment Overview
                </CardTitle>
                <CardDescription>
                  Tools and equipment assigned to this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <div className="space-y-3">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                ) : resourcesData?.equipment?.length > 0 ? (
                  <div className="space-y-4">
                    {/* Equipment Summary */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold">{resourcesData?.equipment?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Assigned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {resourcesData.equipment.filter((eq: any) => eq.owned).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Owned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {resourcesData.equipment.filter((eq: any) => !eq.owned).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Rented</div>
                      </div>
                    </div>

                    {/* Equipment List */}
                    <div className="space-y-2">
                      {resourcesData.equipment.slice(0, 3).map((equipment: any) => (
                        <div key={equipment.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <HardHat className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{equipment.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {equipment.type} • {equipment.crew_name} • {equipment.period}
                              </div>
                              {equipment.daily_rate > 0 && (
                                <div className="text-xs text-blue-600">
                                  €{equipment.daily_rate}/day (€{equipment.total_cost?.toFixed(2)} total)
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={equipment.owned ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {equipment.owned ? 'Owned' : 'Rented'}
                          </Badge>
                        </div>
                      ))}
                      {resourcesData.equipment.length > 3 && (
                        <div className="text-center text-sm text-muted-foreground">
                          +{resourcesData.equipment.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No equipment assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transport Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Transport Overview
                </CardTitle>
                <CardDescription>
                  Vehicles and transport assigned to teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <div className="space-y-3">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                ) : resourcesData?.vehicles?.length > 0 ? (
                  <div className="space-y-4">
                    {/* Transport Summary */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold">{resourcesData?.vehicles?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Assigned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {resourcesData.vehicles.filter((v: any) => v.owned).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Owned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {resourcesData.vehicles.filter((v: any) => !v.owned).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Rented</div>
                      </div>
                    </div>

                    {/* Vehicle List */}
                    <div className="space-y-2">
                      {resourcesData.vehicles.slice(0, 3).map((vehicle: any) => (
                        <div key={vehicle.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                {vehicle.brand} {vehicle.model}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {vehicle.plate_number} • {vehicle.type} • {vehicle.crew_name}
                              </div>
                              {vehicle.tipper_type && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Badge variant="outline" className={vehicle.tipper_type === 'Kipper' ? 'bg-orange-100 text-orange-800 border-orange-200 text-xs' : 'bg-gray-100 text-gray-800 border-gray-200 text-xs'}>
                                    {vehicle.tipper_type}
                                  </Badge>
                                  {vehicle.max_weight_kg && (
                                    <span>• Max: {vehicle.max_weight_kg} kg</span>
                                  )}
                                </div>
                              )}
                              {vehicle.comment && (
                                <div className="text-xs text-muted-foreground italic">
                                  {vehicle.comment}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {vehicle.period}
                              </div>
                              {vehicle.daily_rate > 0 && (
                                <div className="text-xs text-blue-600">
                                  €{vehicle.daily_rate}/day (€{vehicle.total_cost?.toFixed(2)} total)
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={vehicle.owned ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {vehicle.owned ? 'Owned' : 'Rented'}
                          </Badge>
                        </div>
                      ))}
                      {resourcesData.vehicles.length > 3 && (
                        <div className="text-center text-sm text-muted-foreground">
                          +{resourcesData.vehicles.length - 3} more vehicles
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No vehicles assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Documents</CardTitle>
              <CardDescription>
                Files, plans, and documentation related to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-4">
                  <div className="skeleton h-20 w-full rounded-lg" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              ) : documentsData?.documents?.length > 0 ? (
                <div className="space-y-6">
                  {/* Document Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                    {documentsData.categories.map((category: any) => (
                      <div key={category.id} className="text-center">
                        <div className="text-2xl font-bold" style={{ color: category.color }}>
                          {category.count}
                        </div>
                        <div className="text-sm text-muted-foreground">{category.name}</div>
                      </div>
                    ))}
                  </div>

                  {/* Documents List */}
                  <div className="space-y-4">
                    {documentsData.documents.map((doc: any) => (
                      <Card key={doc.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              {doc.is_image ? (
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-purple-600" />
                                </div>
                              ) : doc.is_pdf ? (
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-red-600" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{doc.file_name}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                <span>{doc.size_formatted}</span>
                                <span>•</span>
                                <span>Uploaded by {doc.uploaded_by_name}</span>
                                <span>•</span>
                                <span>{new Date(doc.uploaded_at).toLocaleDateString('de-DE')}</span>
                              </div>
                              {doc.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{doc.notes}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    borderColor: documentsData.categories.find((c: any) => c.id === doc.document_type)?.color,
                                    color: documentsData.categories.find((c: any) => c.id === doc.document_type)?.color
                                  }}
                                >
                                  {doc.document_type}
                                </Badge>
                                <Badge
                                  variant={doc.status === 'active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {doc.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingDocument(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.file_path;
                                link.download = doc.file_name || 'download';
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination Info */}
                  {documentsData.pagination && documentsData.pagination.total > documentsData.pagination.per_page && (
                    <div className="text-center text-sm text-muted-foreground">
                      Showing {documentsData.documents.length} of {documentsData.pagination.total} documents
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded for this project yet.</p>
                  <Button variant="outline" className="mt-4">
                    Upload Documents
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>
                Budget, costs, and financial tracking for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Project Budget</p>
                  <p className="text-lg font-mono">
                    €{(stats?.financial.projectBudget || (project.total_length_m * project.base_rate_per_m)).toLocaleString('de-DE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Spent to Date</p>
                  <p className="text-lg font-mono">
                    €{(stats?.financial.totalSpent || 0).toLocaleString('de-DE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Remaining Budget</p>
                  <p className="text-lg font-mono">
                    €{(stats?.financial.remainingBudget || (project.total_length_m * project.base_rate_per_m)).toLocaleString('de-DE', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Spent Percentage</p>
                  <p className="text-lg font-mono">{stats?.financial.spentPercentage || 0}%</p>
                  <Progress value={stats?.financial.spentPercentage || 0} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Preview Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.file_name || 'Document Preview'}</DialogTitle>
            <DialogDescription>
              {viewingDocument?.size_formatted || 'Unknown size'} • Uploaded by {viewingDocument?.uploaded_by_name || 'Unknown'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {(() => {
              const fileName = viewingDocument?.file_name?.toLowerCase() || '';
              const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/);
              const isPdf = fileName.match(/\.pdf$/);

              if (isImage) {
                return (
                  <img
                    src={viewingDocument.file_path}
                    alt={viewingDocument.file_name}
                    className="max-w-full h-auto mx-auto"
                  />
                );
              } else if (isPdf) {
                return (
                  <iframe
                    src={viewingDocument.file_path}
                    className="w-full h-96"
                    title={viewingDocument.file_name}
                  />
                );
              } else {
                return (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Preview not available for this file type
                    </p>
                    <Button
                      onClick={() => {
                        if (viewingDocument?.file_path) {
                          const link = document.createElement('a');
                          link.href = viewingDocument.file_path;
                          link.download = viewingDocument.file_name || 'download';
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      className="mt-4"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                );
              }
            })()}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (viewingDocument?.file_path) {
                  const link = document.createElement('a');
                  link.href = viewingDocument.file_path;
                  link.download = viewingDocument.file_name || 'download';
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="default" onClick={() => setViewingDocument(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <strong> "{project?.name}"</strong> and all associated data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Work entries and progress data</li>
                <li>Material allocations and costs</li>
                <li>Team assignments</li>
                <li>Documents and files</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}