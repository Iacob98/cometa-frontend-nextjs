import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ProjectConstraint {
  id: string;
  project_id: string;
  constraint_type: string;
  frontend_type?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'escalated' | 'cancelled';
  location?: string;
  identified_date: string;
  resolved_date?: string;
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConstraintData {
  type: string;
  severity: string;
  location?: string;
  description: string;
}

export const constraintKeys = {
  all: ["constraints"] as const,
  projectConstraints: (projectId: string) => [...constraintKeys.all, "project", projectId] as const,
}

export function useProjectConstraints(projectId: string) {
  return useQuery({
    queryKey: constraintKeys.projectConstraints(projectId),
    queryFn: async (): Promise<ProjectConstraint[]> => {
      const response = await fetch(`/api/projects/${projectId}/constraints`);
      if (!response.ok) {
        throw new Error('Failed to fetch project constraints');
      }
      return response.json();
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateConstraint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, ...data }: CreateConstraintData & { projectId: string }) => {
      const response = await fetch(`/api/projects/${projectId}/constraints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create constraint');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: constraintKeys.projectConstraints(variables.projectId)
      });

      toast.success('Project constraint added successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to add constraint: ${error.message}`);
    },
  });
}

export function useDeleteConstraint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, constraintId }: { projectId: string; constraintId: string }) => {
      const response = await fetch(`/api/projects/${projectId}/constraints?constraint_id=${constraintId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete constraint');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: constraintKeys.projectConstraints(variables.projectId)
      });

      toast.success('Constraint removed successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to remove constraint: ${error.message}`);
    },
  });
}