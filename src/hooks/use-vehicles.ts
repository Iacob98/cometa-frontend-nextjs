import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  type: 'pkw' | 'lkw' | 'transporter' | 'pritsche' | 'anhänger' | 'excavator' | 'other';
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  rental_cost_per_day: number;
  fuel_type?: string;
  year_manufactured?: number;
  description?: string;
  is_active: boolean;
  tipper_type: 'Kipper' | 'kein Kipper';
  max_weight_kg?: number | null;
  comment?: string | null;
  // NEW FIELDS
  number_of_seats?: number | null;
  fuel_consumption_per_100km?: number | null;
  has_first_aid_kit?: boolean;
  first_aid_kit_expiry_date?: string | null;
  // END NEW FIELDS
  full_name?: string;
  age?: number;
  current_assignment?: any;
  assignments_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleAssignment {
  id: string;
  vehicle_id: string;
  project_id?: string; // Now optional - crew-based logic
  crew_id: string; // Now required - crew-based logic
  from_ts: string;
  to_ts?: string;
  is_permanent: boolean;
  rental_cost_per_day: number;
  vehicle: {
    brand: string;
    model: string;
    plate_number: string;
    type: string;
  };
  project_name?: string;
  crew_name?: string;
  is_active: boolean;
}

export interface CreateVehicleData {
  brand: string;
  model: string;
  plate_number: string;
  type: string;
  status?: string;
  rental_cost_per_day?: number;
  fuel_type?: string;
  year_manufactured?: number;
  description?: string;
  tipper_type: 'Kipper' | 'kein Kipper';
  max_weight_kg?: number | null;
  comment?: string | null;
  // NEW FIELDS
  number_of_seats?: number | null;
  fuel_consumption_per_100km?: number | null;
  has_first_aid_kit?: boolean;
  first_aid_kit_expiry_date?: string | null;
}

export interface CreateVehicleAssignmentData {
  vehicle_id: string;
  project_id?: string; // Now optional - crew-based logic
  crew_id: string; // Now required - crew-based logic
  from_ts: string;
  to_ts?: string;
  is_permanent?: boolean;
  rental_cost_per_day?: number;
}

export interface VehicleAnalytics {
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
  vehicles: {
    totalCount: number;
    byType: Record<string, { count: number; value: number }>;
    byStatus: Record<string, number>;
  };
}

interface VehicleFilters {
  type?: string;
  status?: string;
  owned?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

interface VehicleAssignmentFilters {
  vehicle_id?: string;
  project_id?: string;
  crew_id?: string;
  active_only?: boolean;
}

const api = {
  getVehicles: async (filters?: VehicleFilters): Promise<{ items: Vehicle[]; total: number; page: number; per_page: number; total_pages: number }> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.owned) params.append('owned', filters.owned);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const url = `/api/vehicles${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch vehicles');
    }

    const data = await response.json();

    // Transform the API response to match expected format
    return {
      items: data.vehicles || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      per_page: data.pagination?.per_page || 20,
      total_pages: data.pagination?.total_pages || 1
    };
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    const response = await fetch(`/api/vehicles/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle');
    }

    return response.json();
  },

  createVehicle: async (data: CreateVehicleData): Promise<Vehicle> => {
    const response = await fetch('/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create vehicle');
    }

    const result = await response.json();
    return result.vehicle || result;
  },

  updateVehicle: async (id: string, data: Partial<Vehicle>): Promise<{ success: boolean }> => {
    const response = await fetch(`/api/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update vehicle');
    }

    return response.json();
  },

  deleteVehicle: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`/api/vehicles/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete vehicle');
    }

    return response.json();
  },

  getVehicleAssignments: async (filters?: VehicleAssignmentFilters): Promise<VehicleAssignment[]> => {
    const params = new URLSearchParams();
    if (filters?.vehicle_id) params.append('vehicle_id', filters.vehicle_id);
    if (filters?.project_id) params.append('project_id', filters.project_id);
    if (filters?.crew_id) params.append('crew_id', filters.crew_id);
    if (filters?.active_only) params.append('active_only', filters.active_only.toString());

    // Use new vehicles/assignments endpoint for crew-based logic
    const url = `/api/resources/vehicle-assignments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle assignments');
    }

    return response.json();
  },

  createVehicleAssignment: async (data: CreateVehicleAssignmentData): Promise<{ success: boolean; assignment_id: string; message: string }> => {
    // Use new vehicles/assignments endpoint with crew-based logic
    const response = await fetch('/api/resources/vehicle-assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vehicle_id: data.vehicle_id,
        crew_id: data.crew_id, // Now required
        project_id: data.project_id, // Now optional
        from_ts: data.from_ts,
        to_ts: data.to_ts,
        is_permanent: data.is_permanent || false,
        rental_cost_per_day: data.rental_cost_per_day
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create vehicle assignment');
    }

    return response.json();
  },

  updateVehicleAssignment: async (id: string, data: Partial<VehicleAssignment>): Promise<{ success: boolean; message: string }> => {
    // Use new vehicles/assignments endpoint
    const response = await fetch(`/api/resources/vehicle-assignments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update vehicle assignment');
    }

    return response.json();
  },

  deleteVehicleAssignment: async (id: string): Promise<{ success: boolean; message: string }> => {
    // Use new vehicles/assignments endpoint
    const response = await fetch(`/api/resources/vehicle-assignments/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete vehicle assignment');
    }

    return response.json();
  },

  getAvailableVehicles: async (): Promise<Vehicle[]> => {
    const response = await fetch('/api/resources/vehicles/available');

    if (!response.ok) {
      throw new Error('Failed to fetch available vehicles');
    }

    return response.json();
  },

  getVehicleAnalytics: async (): Promise<VehicleAnalytics> => {
    const response = await fetch('/api/vehicles/analytics');

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle analytics');
    }

    return response.json();
  },
};

export function useVehicles(filters?: VehicleFilters) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => api.getVehicles(filters),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => api.getVehicle(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      api.updateVehicle(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', id] });
      toast.success('Vehicle updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useVehicleAssignments(filters?: VehicleAssignmentFilters) {
  return useQuery({
    queryKey: ['vehicle-assignments', filters],
    queryFn: () => api.getVehicleAssignments(filters),
    staleTime: 30 * 1000, // 30 seconds - crew assignments change frequently
  });
}

export function useCreateVehicleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createVehicleAssignment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['crews'] }); // Also invalidate crew queries
      toast.success(data.message || 'Vehicle assignment created successfully');
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

export function useUpdateVehicleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VehicleAssignment> }) =>
      api.updateVehicleAssignment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(data.message || 'Vehicle assignment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteVehicleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteVehicleAssignment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success(data.message || 'Vehicle assignment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAvailableVehicles() {
  return useQuery({
    queryKey: ['vehicles', 'available'],
    queryFn: () => api.getAvailableVehicles(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useVehicleAnalytics() {
  return useQuery({
    queryKey: ['vehicle-analytics'],
    queryFn: () => api.getVehicleAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// New hook for crew-based vehicle assignments (only vehicles)
export function useCrewVehicleAssignments(crew_id?: string) {
  return useQuery({
    queryKey: ['vehicle-assignments', 'crew', crew_id],
    queryFn: async () => {
      const response = await fetch(`/api/resources/vehicle-assignments?crew_id=${crew_id}&active_only=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle assignments');
      }
      return response.json();
    },
    enabled: !!crew_id,
    staleTime: 30 * 1000, // 30 seconds - crew assignments change frequently
  });
}

// Hook for getting vehicle assignments by project (filtered through crew assignments)
export function useProjectVehicleAssignments(project_id?: string) {
  return useQuery({
    queryKey: ['vehicle-assignments', 'project', project_id],
    queryFn: () => api.getVehicleAssignments({ project_id }),
    enabled: !!project_id,
    staleTime: 60 * 1000, // 1 minute - project assignments are more stable
  });
}