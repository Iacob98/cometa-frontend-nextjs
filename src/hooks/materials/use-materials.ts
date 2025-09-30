import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  materialsApi,
  type Material,
  type MaterialFilters,
} from "@/lib/api-client";
import { materialKeys } from "./query-keys";

// ============= QUERIES =============

export function useMaterials(filters?: MaterialFilters) {
  return useQuery({
    queryKey: materialKeys.list(filters || {}),
    queryFn: () => materialsApi.getMaterials(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for inventory accuracy
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => materialsApi.getMaterial(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLowStockMaterials() {
  return useQuery({
    queryKey: materialKeys.lowStock(),
    queryFn: async () => {
      const response = await fetch('/api/materials/low-stock');
      if (!response.ok) {
        throw new Error('Failed to fetch low stock materials');
      }
      const data = await response.json();
      return data.materials || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for stock alerts
  });
}

// ============= MUTATIONS =============

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Material>) => materialsApi.createMaterial(data),
    onSuccess: (newMaterial) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.setQueryData(materialKeys.detail(newMaterial.id), newMaterial);
      toast.success("Material created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create material: ${error.message}`);
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Material> }) =>
      materialsApi.updateMaterial(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: materialKeys.detail(id) });
      const previousMaterial = queryClient.getQueryData(materialKeys.detail(id));

      queryClient.setQueryData(materialKeys.detail(id), (old: Material | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousMaterial };
    },
    onError: (error, { id }, context) => {
      if (context?.previousMaterial) {
        queryClient.setQueryData(materialKeys.detail(id), context.previousMaterial);
      }
      toast.error(`Failed to update material: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.lowStock() });
      toast.success("Material updated successfully");
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(id) });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => materialsApi.deleteMaterial(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: materialKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.lowStock() });
      toast.success("Material deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete material: ${error.message}`);
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adjustment, reason }: { id: string; adjustment: number; reason?: string }) =>
      fetch(`/api/materials/${id}/adjust-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment, reason }),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to adjust stock');
        return res.json();
      }),
    onSuccess: (updatedMaterial, { id }) => {
      // ✅ OPTIMIZED: Мгновенное обновление кэша вместо инвалидации

      // 1. Обновить конкретный материал напрямую
      queryClient.setQueryData(
        materialKeys.detail(id),
        updatedMaterial
      );

      // 2. Обновить материал в списках (если он там ес)
      queryClient.setQueriesData(
        { queryKey: materialKeys.lists() },
        (oldData: any) => {
          if (!oldData?.materials) return oldData;
          return {
            ...oldData,
            materials: oldData.materials.map((m: any) =>
              m.id === id ? { ...m, ...updatedMaterial } : m
            ),
          };
        }
      );

      // 3. Инвалидировать unified warehouse (там более сложная структура)
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "unified-warehouse"]
      });

      // 4. Инвалидировать low stock если нужно
      queryClient.invalidateQueries({ queryKey: materialKeys.lowStock() });

      toast.success("Stock adjusted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to adjust stock: ${error.message}`);
    },
  });
}