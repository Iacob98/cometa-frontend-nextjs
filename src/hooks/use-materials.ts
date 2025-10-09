import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  materialsApi,
  suppliersApi,
  materialAllocationsApi,
  materialOrdersApi,
  type Material,
  type Supplier,
  type MaterialAllocation,
  type MaterialOrder,
  type MaterialFilters,
  type AllocationFilters,
  type OrderFilters,
  type AllocationRequest,
  type MaterialOrderStatus,
  type PaginatedResponse,
} from "@/lib/api-client";

// Query keys
export const materialKeys = {
  all: ["materials"] as const,
  lists: () => [...materialKeys.all, "list"] as const,
  list: (filters: MaterialFilters) => [...materialKeys.lists(), filters] as const,
  details: () => [...materialKeys.all, "detail"] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  lowStock: () => [...materialKeys.all, "low-stock"] as const,
};

export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

export const allocationKeys = {
  all: ["allocations"] as const,
  lists: () => [...allocationKeys.all, "list"] as const,
  list: (filters: AllocationFilters) => [...allocationKeys.lists(), filters] as const,
  details: () => [...allocationKeys.all, "detail"] as const,
  detail: (id: string) => [...allocationKeys.details(), id] as const,
};

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

// Unified Material Hooks with consistent data source
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
      return data.materials || []; // Extract materials array from API response
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for stock alerts
  });
}

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

      // Transform API response to match ProjectMaterial interface
      const materials = (data.materials || []).map((m: any) => ({
        ...m,
        total_cost: m.total_cost_eur || 0, // Map total_cost_eur to total_cost
        allocated_qty: m.quantity_allocated || 0,
        allocation_date: m.allocated_date || '',
        name: m.material?.name || '',
        unit_price: m.material?.unit_price_eur || 0,
        unit: m.material?.unit || '',
      }));

      return { materials, summary: data.allocation_summary };
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
    mutationFn: ({ id, adjustment }: { id: string; adjustment: { quantity: number; reason: string } }) =>
      materialsApi.adjustStock(id, adjustment),
    onSuccess: (updatedMaterial) => {
      queryClient.setQueryData(materialKeys.detail(updatedMaterial.id), updatedMaterial);
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.lowStock() });
      // Invalidate unified warehouse and allocation views
      queryClient.invalidateQueries({ queryKey: [...materialKeys.all, "unified-warehouse"] });
      queryClient.invalidateQueries({ queryKey: [...materialKeys.all, "allocation-targets"] });
      toast.success("Stock adjusted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to adjust stock: ${error.message}`);
    },
  });
}

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

// Supplier Hooks
export function useSuppliers() {
  return useQuery({
    queryKey: supplierKeys.lists(),
    queryFn: async () => {
      const response = await suppliersApi.getSuppliers();
      return response.items || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - suppliers change less frequently
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => suppliersApi.getSupplier(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Supplier>) => suppliersApi.createSupplier(data),
    onSuccess: (newSupplier) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.setQueryData(supplierKeys.detail(newSupplier.id), newSupplier);
      toast.success("Supplier created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create supplier: ${error.message}`);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) =>
      suppliersApi.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Supplier updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update supplier: ${error.message}`);
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: supplierKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Supplier deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete supplier: ${error.message}`);
    },
  });
}

// Allocation Hooks
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

// Order Hooks
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters || {}),
    queryFn: () => materialOrdersApi.getOrders(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => materialOrdersApi.getOrder(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MaterialOrder>) => materialOrdersApi.createOrder(data),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);
      toast.success("Order created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MaterialOrderStatus }) =>
      materialOrdersApi.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      // If order is delivered, update material stock levels
      if (updatedOrder.status === "delivered") {
        queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
        queryClient.invalidateQueries({ queryKey: materialKeys.lowStock() });
      }

      toast.success("Order status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });
}

// Specialized hooks
export function useProjectAllocations(projectId: string) {
  return useAllocations({ project_id: projectId });
}

export function useTeamAllocations(teamId: string) {
  return useAllocations({ team_id: teamId });
}

export function usePendingOrders() {
  return useOrders({ status: "pending" });
}

export function useSupplierOrders(supplierId: string) {
  return useOrders({ supplier_id: supplierId });
}

// Project Preparation specific hooks
export interface ProjectMaterial {
  id: string;
  material_id: string;
  name: string;
  sku?: string;
  unit: string;
  description?: string;
  allocated_qty: number;
  unit_price: number;
  total_cost: number;
  allocation_date: string;
  return_date?: string;
  status: 'allocated' | 'used' | 'returned' | 'cancelled';
  notes?: string;
  allocated_by_name?: string;
}

export interface WarehouseMaterial {
  id: string;
  name: string;
  sku?: string;
  unit: string;
  description?: string;
  available_qty: number;
  total_qty: number;
  reserved_qty: number;
  min_stock: number;
  price: number;
}

export interface ProjectMaterialsResponse {
  materials: ProjectMaterial[];
  summary: {
    total_materials: number;
    pending_count: number;
    used_count: number;
    total_cost: number;
  };
}

export interface MaterialAssignmentData {
  project_id: string;
  material_id: string;
  quantity: number;
  from_date: string;
  to_date?: string;
  notes?: string;
}

export interface UpdateMaterialAssignmentData {
  assignment_id: string;
  quantity: number;
  unit_price: number;
  from_date: string;
  to_date?: string;
  notes?: string;
}

export function useProjectMaterials(projectId: string) {
  return useQuery({
    queryKey: [...materialKeys.all, "project", projectId],
    queryFn: async (): Promise<ProjectMaterialsResponse> => {
      const response = await fetch(`/api/materials/project/${projectId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch project materials');
      }
      return response.json();
    },
    enabled: !!projectId,
    staleTime: 0, // Force fresh data every time
    gcTime: 0, // Don't keep old data in memory
  });
}

export function useWarehouseMaterials() {
  return useQuery({
    queryKey: [...materialKeys.all, "warehouse"],
    queryFn: async (): Promise<WarehouseMaterial[]> => {
      const response = await fetch('/api/materials/warehouse');
      if (!response.ok) {
        throw new Error('Failed to fetch warehouse materials');
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAssignMaterialToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MaterialAssignmentData) => {
      const response = await fetch('/api/materials/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign material');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate legacy project materials
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "project", variables.project_id]
      });

      // Invalidate unified project materials
      queryClient.invalidateQueries({
        queryKey: [...allocationKeys.all, "project", variables.project_id, "unified"]
      });

      // Invalidate warehouse materials (stock has changed)
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "warehouse"]
      });

      // Invalidate unified warehouse materials
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "unified-warehouse"]
      });

      // Invalidate allocation targets (availability may have changed)
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "allocation-targets"]
      });

      // Force immediate refetch for real-time updates
      queryClient.refetchQueries({
        queryKey: [...allocationKeys.all, "project", variables.project_id, "unified"]
      });

      queryClient.refetchQueries({
        queryKey: [...materialKeys.all, "unified-warehouse"]
      });

      toast.success('Material assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign material: ${error.message}`);
    },
  });
}

export function useUpdateMaterialAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMaterialAssignmentData) => {
      const { assignment_id, ...updateData } = data;
      const response = await fetch(`/api/materials/assignments/${assignment_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update material assignment');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate legacy project materials queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === "materials" &&
                 query.queryKey[1] === "project";
        }
      });

      // Invalidate unified project materials queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes("unified");
        }
      });

      // Invalidate warehouse and allocation targets (stock may have changed)
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "warehouse"]
      });

      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "unified-warehouse"]
      });

      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "allocation-targets"]
      });

      toast.success('Material assignment updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update material assignment: ${error.message}`);
    },
  });
}

export function useDeleteMaterialAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await fetch(`/api/materials/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete material assignment');
      }

      return response.json();
    },
    onSuccess: (data, assignmentId) => {
      // Invalidate all legacy project materials queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === "materials" &&
                 query.queryKey[1] === "project";
        }
      });

      // Invalidate all unified queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes("unified");
        }
      });

      // Invalidate warehouse materials (stock has been restored)
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "warehouse"]
      });

      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "unified-warehouse"]
      });

      // Invalidate allocation targets (availability increased)
      queryClient.invalidateQueries({
        queryKey: [...materialKeys.all, "allocation-targets"]
      });

      toast.success('Material assignment deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete material assignment: ${error.message}`);
    },
  });
}