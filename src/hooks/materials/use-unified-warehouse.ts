import { useQuery } from "@tanstack/react-query";
import { materialKeys, allocationKeys } from "./query-keys";

// Unified Warehouse Materials Hook - Single source of truth for inventory
export function useUnifiedWarehouseMaterials() {
  return useQuery({
    queryKey: [...materialKeys.all, "unified-warehouse"],
    queryFn: async () => {
      const response = await fetch('/api/materials/unified?view=warehouse');
      if (!response.ok) {
        throw new Error('Failed to fetch warehouse materials');
      }
      const data = await response.json();
      return data.materials || [];
    },
    staleTime: 30 * 1000, // 30 seconds for faster updates
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to window
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
}

// Project Material Allocations Hook with unified data
export function useUnifiedProjectMaterials(projectId: string) {
  return useQuery({
    queryKey: [...allocationKeys.all, "project", projectId, "unified"],
    queryFn: async () => {
      const response = await fetch(`/api/materials/unified?view=project_allocations&project_id=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project materials');
      }
      const data = await response.json();
      return { materials: data.materials || [], summary: data.allocation_summary };
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

// Material Allocation Targets Hook
export function useMaterialAllocationTargets() {
  return useQuery({
    queryKey: [...materialKeys.all, "allocation-targets"],
    queryFn: async () => {
      const response = await fetch('/api/materials/unified?view=allocation_targets');
      if (!response.ok) {
        throw new Error('Failed to fetch allocation targets');
      }
      const data = await response.json();
      return data.materials || [];
    },
    staleTime: 30 * 1000, // 30 seconds for responsive allocation targets
    refetchOnWindowFocus: true,
  });
}
