import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for Resource Management
export interface ProjectResource {
  id: string;
  type: 'vehicle' | 'equipment';
  name: string;
  inventory_no?: string;
  plate_number?: string;
  brand?: string;
  model?: string;
  category: string;
  period: string;
  days?: number;
  daily_rate?: number;
  total_cost?: number;
  owned: boolean;
  assignment_source?: 'crew_based' | 'direct';
  crew?: {
    id: string;
    name: string;
  };
  is_active?: boolean;
  from_ts?: string;
  to_ts?: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  type: string;
  status: string;
  rental_price_per_day_eur?: number;
  rental_price_per_hour_eur?: number;
  owned: boolean;
  current_location?: string;
  fuel_consumption_l_per_100km?: number;
  supplier_name?: string;
  period: string;
  days?: number;
  daily_rate?: number;
  total_cost?: number;
  assignment_source?: 'crew_based' | 'direct';
  crew?: {
    id: string;
    name: string;
  };
  is_active?: boolean;
  from_ts?: string;
  to_ts?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  inventory_no: string;
  status: string;
  rental_price_per_day_eur?: number;
  rental_price_per_hour_eur?: number;
  owned: boolean;
  current_location?: string;
  supplier_name?: string;
  purchase_price_eur?: number;
  period: string;
  days?: number;
  daily_rate?: number;
  total_cost?: number;
  assignment_source?: 'crew_based' | 'direct';
  crew?: {
    id: string;
    name: string;
  };
  is_active?: boolean;
  from_ts?: string;
  to_ts?: string;
}

export interface ProjectResourcesResponse {
  vehicles: Vehicle[];
  equipment: Equipment[];
  summary: {
    total_resources: number;
    total_vehicles: number;
    total_equipment: number;
    total_cost: number;
  };
}

export interface VehicleAssignmentData {
  project_id: string;
  vehicle_id: string;
  crew_id?: string | null;
  from_date: string;
  to_date?: string;
  driver_name?: string;
  purpose?: string;
  is_permanent: boolean;
  notes?: string;
}

export interface EquipmentAssignmentData {
  project_id: string;
  equipment_id: string;
  crew_id?: string | null;
  from_date: string;
  to_date?: string;
  operator_name?: string;
  purpose?: string;
  is_permanent: boolean;
  notes?: string;
}

export interface RentalVehicleData {
  project_id: string;
  crew_id?: string;
  brand: string;
  model: string;
  plate_number: string;
  type: string;
  rental_company: string;
  daily_rate: number;
  hourly_rate?: number;
  fuel_consumption: number;
  rental_start: string;
  rental_end?: string;
  driver_name?: string;
  purpose?: string;
  contract_notes?: string;
}

export interface RentalEquipmentData {
  project_id: string;
  crew_id?: string;
  name: string;
  type: string;
  inventory_no: string;
  rental_company: string;
  daily_rate: number;
  hourly_rate?: number;
  rental_start: string;
  rental_end?: string;
  operator_name?: string;
  purpose?: string;
  contract_notes?: string;
}

export interface Crew {
  id: string;
  name: string;
  status: string;
  project_id: string;
}

// Query keys
export const resourceKeys = {
  all: ["resources"] as const,
  projectResources: (projectId: string) => [...resourceKeys.all, "project", projectId] as const,
  projectCrews: (projectId: string) => [...resourceKeys.all, "project-crews", projectId] as const,
  availableVehicles: () => [...resourceKeys.all, "available-vehicles"] as const,
  availableEquipment: () => [...resourceKeys.all, "available-equipment"] as const,
};

// Hooks
export function useProjectResources(projectId: string) {
  return useQuery({
    queryKey: resourceKeys.projectResources(projectId),
    queryFn: async (): Promise<ProjectResourcesResponse> => {
      const response = await fetch(`/api/projects/${projectId}/resources`);
      if (!response.ok) {
        throw new Error('Failed to fetch project resources');
      }
      return response.json();
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProjectCrews(projectId: string) {
  return useQuery({
    queryKey: resourceKeys.projectCrews(projectId),
    queryFn: async (): Promise<Crew[]> => {
      const response = await fetch(`/api/crews?project_id=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project crews');
      }
      return response.json();
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAvailableVehicles() {
  return useQuery({
    queryKey: resourceKeys.availableVehicles(),
    queryFn: async (): Promise<Vehicle[]> => {
      const response = await fetch('/api/vehicles?status=available&per_page=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch available vehicles');
      }
      const data = await response.json();
      return data.vehicles || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAvailableEquipment() {
  return useQuery({
    queryKey: resourceKeys.availableEquipment(),
    queryFn: async (): Promise<Equipment[]> => {
      const response = await fetch('/api/equipment?status=available&per_page=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch available equipment');
      }
      const data = await response.json();
      return data.items || []; // API returns { items: [...], total, page, per_page }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateVehicleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VehicleAssignmentData) => {
      const response = await fetch('/api/resources/vehicle-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: data.vehicle_id,
          crew_id: data.crew_id || null,
          project_id: data.project_id,
          from_ts: data.from_date,
          to_ts: data.to_date || null,
          is_permanent: data.is_permanent,
          rental_cost_per_day: 0, // Will be calculated from vehicle data
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign vehicle');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch project resources
      queryClient.invalidateQueries({
        queryKey: resourceKeys.projectResources(variables.project_id)
      });

      // Invalidate available vehicles list
      queryClient.invalidateQueries({
        queryKey: resourceKeys.availableVehicles()
      });

      toast.success('Vehicle assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign vehicle: ${error.message}`);
    },
  });
}

export function useCreateEquipmentAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EquipmentAssignmentData) => {
      const response = await fetch('/api/resources/equipment-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_id: data.equipment_id,
          crew_id: data.crew_id || null,
          project_id: data.project_id,
          from_ts: data.from_date,
          to_ts: data.to_date || null,
          is_permanent: data.is_permanent,
          rental_cost_per_day: 0, // Will be calculated from equipment data
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign equipment');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch project resources
      queryClient.invalidateQueries({
        queryKey: resourceKeys.projectResources(variables.project_id)
      });

      // Invalidate available equipment list
      queryClient.invalidateQueries({
        queryKey: resourceKeys.availableEquipment()
      });

      toast.success('Equipment assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign equipment: ${error.message}`);
    },
  });
}

export function useCreateRentalVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RentalVehicleData) => {
      const response = await fetch('/api/resources/rental-vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create rental vehicle');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch project resources
      queryClient.invalidateQueries({
        queryKey: resourceKeys.projectResources(variables.project_id)
      });

      // Invalidate available vehicles list
      queryClient.invalidateQueries({
        queryKey: resourceKeys.availableVehicles()
      });

      toast.success('Rental vehicle created and assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create rental vehicle: ${error.message}`);
    },
  });
}

export function useCreateRentalEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RentalEquipmentData) => {
      const response = await fetch('/api/resources/rental-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create rental equipment');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch project resources
      queryClient.invalidateQueries({
        queryKey: resourceKeys.projectResources(variables.project_id)
      });

      // Invalidate available equipment list
      queryClient.invalidateQueries({
        queryKey: resourceKeys.availableEquipment()
      });

      toast.success('Rental equipment created and assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create rental equipment: ${error.message}`);
    },
  });
}

export function useRemoveResourceAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, resourceId, resourceType }: {
      projectId: string;
      resourceId: string;
      resourceType: 'vehicle' | 'equipment';
    }) => {
      // TODO: Implement proper resource assignment removal API
      throw new Error('Resource assignment removal feature is not yet implemented');
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch project resources
      queryClient.invalidateQueries({
        queryKey: resourceKeys.projectResources(variables.projectId)
      });

      // Invalidate available resources lists
      if (variables.resourceType === 'vehicle') {
        queryClient.invalidateQueries({
          queryKey: resourceKeys.availableVehicles()
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: resourceKeys.availableEquipment()
        });
      }

      toast.success('Resource assignment removed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to remove resource assignment: ${error.message}`);
    },
  });
}