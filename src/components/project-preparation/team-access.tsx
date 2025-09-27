'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Trash2,
  Shield
} from 'lucide-react';
import { useProjectTeams, useGlobalTeams, useUpdateTeam } from '@/hooks/use-teams';
import { toast } from 'sonner';

interface TeamAccessProps {
  projectId: string;
}

export default function TeamAccess({ projectId }: TeamAccessProps) {
  const { data: projectTeams, isLoading: projectTeamsLoading } = useProjectTeams(projectId);
  const { data: globalTeams, isLoading: globalTeamsLoading } = useGlobalTeams();
  const updateTeamMutation = useUpdateTeam();

  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const handleUnassignTeam = async (teamId: string, teamName: string) => {
    if (confirm(`Are you sure you want to unassign team "${teamName}" from this project?`)) {
      try {
        await updateTeamMutation.mutateAsync({
          id: teamId,
          data: {
            project_id: null,
          }
        });
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleAssignTeam = async (teamId: string) => {
    try {
      await updateTeamMutation.mutateAsync({
        id: teamId,
        data: {
          project_id: projectId,
        }
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Teams</h3>
          <p className="text-gray-600">
            Manage project teams. Foremen automatically get Work Entry access rights.
          </p>
        </div>
      </div>
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Teams Assigned to Project</h4>
            <div className="flex items-center gap-2">
              <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Assign Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Assign Team to Project</DialogTitle>
                    <DialogDescription>
                      Select a team to assign to this project. Only unassigned teams are shown.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {globalTeams?.filter(team => !projectTeams?.find(pt => pt.id === team.id))?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                        <p>No available teams to assign</p>
                        <p className="text-sm">All teams are already assigned to projects</p>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {globalTeams?.filter(team => !projectTeams?.find(pt => pt.id === team.id))?.map((team) => (
                          <Button
                            key={team.id}
                            variant="ghost"
                            className="justify-start h-auto p-3 border border-gray-200 hover:border-blue-300"
                            onClick={() => {
                              handleAssignTeam(team.id);
                              setShowAssignDialog(false);
                            }}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="text-left">
                                <div className="font-medium">{team.name}</div>
                                {team.foreman_name && (
                                  <div className="text-sm text-gray-600 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {team.foreman_name}
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-sm text-gray-500">
                                <div>{team.member_count || 0} members</div>
                                {team.is_active && (
                                  <div className="text-green-600">Active</div>
                                )}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Teams List */}
          <Card>
            <CardHeader>
              <CardTitle>Project Teams</CardTitle>
              <CardDescription>
                {projectTeams?.length || 0} teams assigned to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectTeamsLoading ? (
                <div>Loading teams...</div>
              ) : !projectTeams || projectTeams.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Teams Assigned</h3>
                  <p className="text-gray-600 mb-4">
                    Assign teams from the global teams list to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Foreman</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectTeams?.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell className="font-medium">
                            {team.name}
                          </TableCell>
                          <TableCell>
                            {team.foreman_name ? (
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-600" />
                                {team.foreman_name}
                              </div>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={team.is_active ? "default" : "secondary"}
                            >
                              {team.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {team.member_count || 0} members
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnassignTeam(team.id, team.name)}
                              disabled={updateTeamMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              Unassign
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Statistics */}
          {projectTeams && projectTeams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{projectTeams.length}</div>
                  <div className="text-sm text-gray-600">Total Teams</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {projectTeams.filter(t => t.foreman_name).length}
                  </div>
                  <div className="text-sm text-gray-600">With Foremen</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {projectTeams.filter(t => t.is_active).length}
                  </div>
                  <div className="text-sm text-gray-600">Active Teams</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {projectTeams.reduce((sum, t) => sum + (t.member_count || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </CardContent>
              </Card>
            </div>
          )}


      {/* Access Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Team Access Rights</CardTitle>
          <CardDescription>
            Foremen automatically get Work Entry permissions when their team is assigned to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Foreman Access</div>
                <div className="text-sm text-blue-600">
                  Can create Work Entries and upload progress photos for their team's work
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
              <Users className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Crew Members</div>
                <div className="text-sm text-green-600">
                  Work under foreman supervision, can view work assignments
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}