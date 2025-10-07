import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Equipment {
  id: string;
  type: 'machine' | 'tool' | 'measuring_device';
  name: string;
  inventory_no?: string;
  owned: boolean;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  purchase_price_eur: number;
  rental_price_per_day_eur: number;
  rental_price_per_hour_eur: number;
  current_location?: string;
  quantity?: number; // Available quantity in inventory
}

export interface EquipmentAssignment {
  id: string;
  equipment_id: string;
  resource_id?: string; // For unified assignments
  project_id?: string; // Now optional - crew-based logic
  cabinet_id?: string;
  crew_id: string; // Now required - crew-based logic
  from_ts: string;
  to_ts?: string;
  is_permanent: boolean;
  rental_cost_per_day: number;
  equipment: {
    name: string;
    type: string;
    inventory_no?: string;
  };
  project_name?: string;
  crew_name?: string;
  is_active: boolean;
  assignment_type?: 'equipment' | 'vehicle'; // For unified assignments
  resource_type?: 'equipment' | 'vehicle'; // For UI distinction
}

export interface CreateEquipmentData {
  type: string;
  name: string;
  inventory_no?: string;
  owned?: boolean;
  status?: string;
  purchase_price_eur?: number;
  rental_price_per_day_eur?: number;
  rental_price_per_hour_eur?: number;
  current_location?: string;
}

export interface CreateAssignmentData {
  equipment_id: string;
  project_id?: string; // Now optional - crew-based logic
  cabinet_id?: string;
  crew_id: string; // Now required - crew-based logic
  from_ts: string;
  to_ts?: string;
  is_permanent?: boolean;
  rental_cost_per_day?: number;
}

export interface EquipmentAnalytics {
  overview: {
    totalHours: number;
    efficiencyScore: number;
    downtimeRate: number;
    revenueGenerated: number;
  };
  statusDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  utilization: {
    name: string;
    hours: number;
    revenue: number;
    assignments: number;
  }[];
  assignments: {
    total: number;
    active: number;
    averageDailyCost: number;
    totalDailyRevenue: number;
    averageDuration: number;
  };
  equipment: {
    totalCount: number;
    byType: Record<string, { count: number; value: number }>;
    byStatus: Record<string, number>;
  };
}

interface EquipmentFilters {
  type?: string;
  status?: string;
  owned?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

interface AssignmentFilters {
  equipment_id?: string;
  project_id?: string;
  crew_id?: string;
  active_only?: boolean;
}

const api = {
  getEquipment: async (filters?: EquipmentFilters): Promise<{ items: Equipment[]; total: number; page: number; per_page: number; total_pages: number }> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.owned) params.append('owned', filters.owned);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const url = `/api/equipment${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch equipment');
    }

    return response.json();
  },

  getEquipmentItem: async (id: string): Promise<Equipment> => {
    const response = await fetch(`/api/equipment/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch equipment');
    }

    return response.json();
  },

  createEquipment: async (data: CreateEquipmentData): Promise<Equipment> => {
    const response = await fetch('/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create equipment');
    }

    return response.json();
  },

  updateEquipment: async (id: string, data: Partial<Equipment>): Promise<{ success: boolean }> => {
    const response = await fetch(`/api/equipment/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update equipment');
    }

    return response.json();
  },

  deleteEquipment: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`/api/equipment/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete equipment');
    }

    return response.json();
  },

  getAssignments: async (filters?: AssignmentFilters): Promise<EquipmentAssignment[]> => {
    const params = new URLSearchParams();
    if (filters?.equipment_id) params.append('equipment_id', filters.equipment_id);
    if (filters?.project_id) params.append('project_id', filters.project_id);
    if (filters?.crew_id) params.append('crew_id', filters.crew_id);
    if (filters?.active_only) params.append('active_only', filters.active_only.toString());

    // Use resources equipment assignments API (unified endpoint)
    const url = `/api/resources/equipment-assignments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch equipment assignments');
    }

    const data = await response.json();

    // Transform our API response to match expected format
    const assignments = data.items || data;

    // For now, use basic transformation. TODO: Enhance with actual equipment/crew names
    return assignments.map((assignment: any) => ({
      id: assignment.id,
      equipment_id: assignment.equipment_id || assignment.resource_id,
      project_id: assignment.project_id,
      crew_id: assignment.crew_id,
      from_ts: assignment.assigned_at,
      to_ts: assignment.returned_at,
      is_permanent: !assignment.returned_at, // If no return date, consider permanent
      rental_cost_per_day: assignment.daily_rental_cost || 0,
      equipment: {
        name: assignment.equipment_name || `Equipment ${assignment.equipment_id?.slice(-8) || 'Unknown'}`,
        type: assignment.resource_type || 'equipment',
        inventory_no: assignment.equipment_id
      },
      project_name: assignment.project_name || (assignment.project_id ? `Project ${assignment.project_id.slice(-8)}` : undefined),
      crew_name: assignment.crew_name || (assignment.crew_id ? `Crew ${assignment.crew_id.slice(-8)}` : undefined),
      is_active: !assignment.returned_at,
      assignment_type: assignment.resource_type,
      resource_type: assignment.resource_type,
      notes: assignment.notes
    }));
  },

  createAssignment: async (data: CreateAssignmentData): Promise<{ success: boolean; assignment_id: string; message: string }> => {
    const response = await fetch('/api/resources/equipment-assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create assignment');
    }

    return response.json();
  },

  updateAssignment: async (id: string, data: Partial<EquipmentAssignment>): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/resources/equipment-assignments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update assignment');
    }

    return response.json();
  },

  deleteAssignment: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/resources/equipment-assignments/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete assignment');
    }

    return response.json();
  },

  getAnalytics: async (): Promise<EquipmentAnalytics> => {
    const response = await fetch('/api/equipment/analytics');

    if (!response.ok) {
      throw new Error('Failed to fetch equipment analytics');
    }

    return response.json();
  },
};

export function useEquipment(filters?: EquipmentFilters) {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => api.getEquipment(filters),
  });
}

export function useEquipmentItem(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => api.getEquipmentItem(id),
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) =>
      api.updateEquipment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', id] });
      toast.success('Equipment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useEquipmentAssignments(filters?: AssignmentFilters) {
  return useQuery({
    queryKey: ['equipment-assignments', filters],
    queryFn: () => api.getAssignments(filters),
    staleTime: 30 * 1000, // 30 seconds - crew assignments change frequently
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createAssignment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['crews'] }); // Also invalidate crew queries
      toast.success(data.message || 'Assignment created successfully');
    },
    onError: (error: Error) => {
      // Enhanced error handling for crew validation
      if (error.message.includes('Crew not found') || error.message.includes('CREW_NOT_FOUND')) {
        toast.error('Selected crew is not found or inactive. Please select a valid crew.');
      } else if (error.message.includes('crew_id') || error.message.includes('Crew ID')) {
        toast.error('Crew selection is required. Please select a crew for this assignment.');
      } else {
        toast.error(error.message);
      }
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EquipmentAssignment> }) =>
      api.updateAssignment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success(data.message || 'Assignment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteAssignment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipment-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success(data.message || 'Assignment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useEquipmentAnalytics() {
  return useQuery({
    queryKey: ['equipment-analytics'],
    queryFn: () => api.getAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// New hook for crew-based equipment assignments (only equipment)
export function useCrewEquipmentAssignments(crew_id?: string) {
  return useQuery({
    queryKey: ['equipment-assignments', 'crew', crew_id],
    queryFn: async () => {
      const response = await fetch(`/api/resources/equipment-assignments?crew_id=${crew_id}&active_only=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment assignments');
      }
      return response.json();
    },
    enabled: !!crew_id,
    staleTime: 30 * 1000, // 30 seconds - crew assignments change frequently
  });
}

// Hook for getting equipment assignments by project (filtered through crew assignments)
export function useProjectEquipmentAssignments(project_id?: string) {
  return useQuery({
    queryKey: ['equipment-assignments', 'project', project_id],
    queryFn: () => api.getAssignments({ project_id }),
    enabled: !!project_id,
    staleTime: 60 * 1000, // 1 minute - project assignments are more stable
  });
}