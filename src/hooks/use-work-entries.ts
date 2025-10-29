'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { WorkEntry } from '@/types';

export interface WorkEntriesResponse {
  items: WorkEntry[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface WorkEntryFilters {
  project_id?: string;
  crew_id?: string;
  user_id?: string;
  stage_code?: string;
  approved?: string;
  page?: number;
  per_page?: number;
}

export interface CreateWorkEntryData {
  project_id: string;
  user_id: string;
  cabinet_id?: string;
  segment_id?: string;
  cut_id?: string;
  house_id?: string;
  crew_id?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  stage_code: string;
  meters_done_m: number;
  method?: string;
  width_m?: number;
  depth_m?: number;
  cables_count?: number;
  has_protection_pipe?: boolean;
  soil_type?: string;
  notes?: string;
}

// Query keys
export const workEntryKeys = {
  all: ["work-entries"] as const,
  lists: () => [...workEntryKeys.all, "list"] as const,
  list: (filters: WorkEntryFilters) => [...workEntryKeys.lists(), filters] as const,
  details: () => [...workEntryKeys.all, "detail"] as const,
  detail: (id: string) => [...workEntryKeys.details(), id] as const,
  stages: () => [...workEntryKeys.all, "stages"] as const,
};

// Fetch work entries with filters
export function useWorkEntries(filters: WorkEntryFilters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return useQuery({
    queryKey: workEntryKeys.list(filters),
    queryFn: async (): Promise<WorkEntriesResponse> => {
      const response = await fetch(`/api/work-entries?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch work entries');
      }
      return response.json();
    },
  });
}

// Fetch single work entry
export function useWorkEntry(id: string) {
  return useQuery({
    queryKey: workEntryKeys.detail(id),
    queryFn: async (): Promise<WorkEntry> => {
      const response = await fetch(`/api/work-entries/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch work entry');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create work entry
export function useCreateWorkEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkEntryData) => {
      const response = await fetch('/api/work-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create work entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workEntryKeys.lists() });
      toast.success('Work entry created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update work entry
export function useUpdateWorkEntry(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateWorkEntryData>) => {
      const response = await fetch(`/api/work-entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update work entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workEntryKeys.detail(id) });
      toast.success('Work entry updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete work entry
export function useDeleteWorkEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/work-entries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete work entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workEntryKeys.lists() });
      toast.success('Work entry deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Approve work entry
export function useApproveWorkEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/work-entries/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve work entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workEntryKeys.details() });
      toast.success('Work entry approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Reject work entry
export function useRejectWorkEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rejection_reason, userId }: { id: string; rejection_reason: string; userId?: string }) => {
      const response = await fetch(`/api/work-entries/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject work entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workEntryKeys.details() });
      toast.success('Work entry rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Resubmit rejected work entry (worker fixes and resubmits)
export function useResubmitWorkEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/work-entries/${id}/resubmit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resubmit work entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workEntryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workEntryKeys.details() });
      toast.success('Work entry resubmitted for approval');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Fetch pending approvals
export function usePendingApprovals() {
  return useWorkEntries({
    approved: 'false',
    page: 1,
    per_page: 50,
  });
}

// Specialized hooks for common use cases
export function useProjectWorkEntries(projectId?: string) {
  return useWorkEntries({
    project_id: projectId,
    page: 1,
    per_page: 20,
  });
}

export function useUserWorkEntries(userId?: string) {
  return useWorkEntries({
    user_id: userId,
    page: 1,
    per_page: 20,
  });
}

export function useCrewWorkEntries(crewId?: string) {
  return useWorkEntries({
    crew_id: crewId,
    page: 1,
    per_page: 20,
  });
}

// Fetch work stages/stage codes
export function useWorkStages() {
  return useQuery({
    queryKey: workEntryKeys.stages(),
    queryFn: async () => {
      const response = await fetch('/api/work-stages');
      if (!response.ok) {
        throw new Error('Failed to fetch work stages');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}