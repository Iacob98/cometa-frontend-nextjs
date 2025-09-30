import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialAllocationsApi } from "@/lib/api-client";
import { allocationKeys, materialKeys } from "./query-keys";
import type { AllocationFilters, AllocationRequest } from "@/lib/api-client";

// Allocation Query Hooks
export function useAllocations(filters?: AllocationFilters) {
  return useQuery({
    queryKey: allocationKeys.list(filters || {}),
    queryFn: () => materialAllocationsApi.getAllocations(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - allocations change frequently
  });
}

export function useAllocation(id: string) {
  return useQuery({
    queryKey: allocationKeys.detail(id),
    queryFn: () => materialAllocationsApi.getAllocation(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// Allocation Mutation Hooks
export function useCreateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AllocationRequest) => materialAllocationsApi.createAllocation(data),
    onSuccess: (newAllocation) => {
      queryClient.invalidateQueries({ queryKey: allocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.lowStock() });
      queryClient.setQueryData(allocationKeys.detail(newAllocation.id), newAllocation);
      toast.success("Material allocated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to allocate material: ${error.message}`);
    },
  });
}

export function useRecordUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, usage }: { id: string; usage: { used_qty: number; notes?: string } }) =>
      materialAllocationsApi.recordUsage(id, usage),
    onSuccess: (updatedAllocation) => {
      queryClient.setQueryData(allocationKeys.detail(updatedAllocation.id), updatedAllocation);
      queryClient.invalidateQueries({ queryKey: allocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      toast.success("Usage recorded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to record usage: ${error.message}`);
    },
  });
}

// Specialized Allocation Hooks
export function useProjectAllocations(projectId: string) {
  return useAllocations({ project_id: projectId });
}

export function useTeamAllocations(teamId: string) {
  return useAllocations({ team_id: teamId });
}