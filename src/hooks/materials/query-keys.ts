import type { MaterialFilters, AllocationFilters, OrderFilters } from "@/lib/api-client";

// Query keys for materials
export const materialKeys = {
  all: ["materials"] as const,
  lists: () => [...materialKeys.all, "list"] as const,
  list: (filters: MaterialFilters) => [...materialKeys.lists(), filters] as const,
  details: () => [...materialKeys.all, "detail"] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  lowStock: () => [...materialKeys.all, "low-stock"] as const,
};

// Query keys for suppliers
export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

// Query keys for allocations
export const allocationKeys = {
  all: ["allocations"] as const,
  lists: () => [...allocationKeys.all, "list"] as const,
  list: (filters: AllocationFilters) => [...allocationKeys.lists(), filters] as const,
  details: () => [...allocationKeys.all, "detail"] as const,
  detail: (id: string) => [...allocationKeys.details(), id] as const,
};

// Query keys for orders
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Centralized cache invalidation function for all material-related queries
export function invalidateAllMaterialQueries(queryClient: any) {
  // Invalidate all material queries
  queryClient.invalidateQueries({ queryKey: materialKeys.all });
  queryClient.invalidateQueries({ queryKey: allocationKeys.all });
  queryClient.invalidateQueries({ queryKey: orderKeys.all });

  // Invalidate unified material views
  queryClient.invalidateQueries({ queryKey: [...materialKeys.all, "unified-warehouse"] });
  queryClient.invalidateQueries({ queryKey: [...materialKeys.all, "allocation-targets"] });

  // Force refetch critical queries
  queryClient.refetchQueries({
    queryKey: [...materialKeys.all, "unified-warehouse"],
    type: 'active'
  });
}