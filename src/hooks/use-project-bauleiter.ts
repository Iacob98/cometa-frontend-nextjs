import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Bauleiter {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role: string;
  lang_pref: string;
}

// Fetch current bauleiter for a project
export function useProjectBauleiter(projectId: string) {
  return useQuery({
    queryKey: ['project-bauleiter', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/bauleiter`);
      if (!response.ok) {
        throw new Error('Failed to fetch bauleiter');
      }
      const data = await response.json();
      return data.bauleiter as Bauleiter | null;
    },
    enabled: !!projectId,
  });
}

// Fetch all available bauleiters
export function useBauleiters() {
  return useQuery({
    queryKey: ['bauleiters'],
    queryFn: async () => {
      const response = await fetch('/api/users/bauleiters');
      if (!response.ok) {
        throw new Error('Failed to fetch bauleiters');
      }
      const data = await response.json();
      return data.bauleiters as Bauleiter[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Assign bauleiter to project
export function useAssignBauleiter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      bauleiter_id,
    }: {
      projectId: string;
      bauleiter_id: string;
    }) => {
      const response = await fetch(`/api/projects/${projectId}/bauleiter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bauleiter_id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign bauleiter');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success('Bauleiter assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['project-bauleiter', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to assign bauleiter', {
        description: error.message,
      });
    },
  });
}

// Unassign bauleiter from project
export function useUnassignBauleiter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/bauleiter`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unassign bauleiter');
      }

      return response.json();
    },
    onSuccess: (data, projectId) => {
      toast.success('Bauleiter unassigned successfully');
      queryClient.invalidateQueries({ queryKey: ['project-bauleiter', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to unassign bauleiter', {
        description: error.message,
      });
    },
  });
}
