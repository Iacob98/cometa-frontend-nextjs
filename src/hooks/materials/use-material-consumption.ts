import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialKeys, allocationKeys } from "@/lib/query-keys";
import { getMutationConfig } from "@/lib/query-utils";

// Material Consumption Hook
export function useConsumeMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    ...getMutationConfig(), // ✅ Add retry strategy
    mutationFn: (data: {
      allocation_id: string;
      consumed_qty: number;
      work_entry_id?: string;
      notes?: string
    }) => {
      return fetch('/api/materials/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(new Error(err.error || 'Failed to consume material')));
        }
        return response.json();
      });
    },
    onSuccess: (result, variables) => {
      // ✅ OPTIMIZED: Точечная инвалидация только затронутых данных

      // 1. Обновить конкретную allocation (если известен ID)
      if (variables.allocation_id) {
        queryClient.invalidateQueries({
          queryKey: allocationKeys.detail(variables.allocation_id)
        });

        // 2. Обновить списки allocations (они содержат consumed_qty)
        queryClient.invalidateQueries({
          queryKey: allocationKeys.lists()
        });
      }

      // 3. Инвалидировать unified warehouse (изменился доступный stock)
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "unified-warehouse"]
      });

      // 4. Инвалидировать allocation targets (availability изменилась)
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "allocation-targets"]
      });

      // 5. Если привязано к work entry, обновить проектные материалы
      if (variables.work_entry_id) {
        // Здесь нужно знать project_id, но его нет в variables
        // Оставляем широкую инвалидацию для project allocations
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey.includes("project") &&
                   query.queryKey.includes("allocations");
          }
        });
      }

      toast.success(result.message || "Material consumed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to consume material: ${error.message}`);
    },
  });
}