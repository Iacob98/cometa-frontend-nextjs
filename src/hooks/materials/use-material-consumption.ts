import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialKeys, allocationKeys } from "./query-keys";

// Material Consumption Hook
export function useConsumeMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
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
      // Invalidate all material-related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: materialKeys.all });
      queryClient.invalidateQueries({ queryKey: [...allocationKeys.all] });
      queryClient.invalidateQueries({ queryKey: [...materialKeys.all, "unified-warehouse"] });
      queryClient.invalidateQueries({ queryKey: [...materialKeys.all, "allocation-targets"] });

      // If we know the project, invalidate project-specific queries
      if (variables.work_entry_id) {
        queryClient.invalidateQueries({ queryKey: [...allocationKeys.all, "project"] });
      }

      toast.success(result.message || "Material consumed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to consume material: ${error.message}`);
    },
  });
}