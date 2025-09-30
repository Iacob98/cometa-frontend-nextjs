import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialKeys, allocationKeys } from "@/lib/query-keys";

// TypeScript Interfaces for Project Material Operations
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

// Project Material Query Hooks
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

// Project Material Assignment Mutation Hooks
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
    onSuccess: (_data, variables) => {
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
    onSuccess: (_data, _variables) => {
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
    onSuccess: (_data, _assignmentId) => {
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