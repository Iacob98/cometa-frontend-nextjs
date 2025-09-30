import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialAllocationsApi } from "@/lib/api-client";
import { allocationKeys, materialKeys } from "@/lib/query-keys";
import { getMutationConfig, getIdempotentMutationConfig } from "@/lib/query-utils";
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
    ...getIdempotentMutationConfig(), // ✅ Safe to retry creates
    mutationFn: (data: AllocationRequest) => materialAllocationsApi.createAllocation(data),
    onSuccess: (newAllocation) => {
      // ✅ OPTIMIZED: Мгновенное добавление в кэш + точечная инвалидация

      // 1. Добавить новую allocation в кэш детали
      queryClient.setQueryData(allocationKeys.detail(newAllocation.id), newAllocation);

      // 2. Добавить в списки allocations (оптимистично)
      queryClient.setQueriesData(
        { queryKey: allocationKeys.lists() },
        (oldData: any) => {
          if (!oldData?.allocations) return oldData;
          return {
            ...oldData,
            allocations: [newAllocation, ...oldData.allocations],
          };
        }
      );

      // 3. Обновить конкретный материал (уменьшить available_qty)
      if (newAllocation.material_id) {
        queryClient.setQueryData(
          materialKeys.detail(newAllocation.material_id),
          (oldMaterial: any) => {
            if (!oldMaterial) return oldMaterial;
            return {
              ...oldMaterial,
              available_qty: oldMaterial.available_qty - newAllocation.allocated_qty,
            };
          }
        );
      }

      // 4. Инвалидировать списки материалов (для consistency)
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });

      // 5. Инвалидировать low stock (может появиться новый)
      queryClient.invalidateQueries({ queryKey: materialKeys.lowStock() });

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
    ...getMutationConfig(), // ✅ Retry on network errors
    mutationFn: ({ id, usage }: { id: string; usage: { used_qty: number; notes?: string } }) =>
      materialAllocationsApi.recordUsage(id, usage),
    onSuccess: (updatedAllocation) => {
      // ✅ OPTIMIZED: Мгновенное обновление кэша

      // 1. Обновить конкретную allocation
      queryClient.setQueryData(allocationKeys.detail(updatedAllocation.id), updatedAllocation);

      // 2. Обновить allocation в списках
      queryClient.setQueriesData(
        { queryKey: allocationKeys.lists() },
        (oldData: any) => {
          if (!oldData?.allocations) return oldData;
          return {
            ...oldData,
            allocations: oldData.allocations.map((a: any) =>
              a.id === updatedAllocation.id ? updatedAllocation : a
            ),
          };
        }
      );

      // 3. Инвалидировать материалы (может измениться consumed_qty)
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