import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface HousingUnit {
  id: string;
  project_id: string;
  house_id?: string;
  unit_number?: string;
  unit_type: string;
  floor?: number;
  room_count?: number;
  area_sqm?: number;
  contact_person?: string;
  contact_phone?: string;
  owner_salutation?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
  access_instructions?: string;
  installation_notes?: string;
  status: string;
  // Rental housing fields
  address?: string;
  rooms_total?: number;
  beds_total?: number;
  occupied_beds?: number;
  rent_daily_eur?: number;
  advance_payment?: number;
  check_in_date?: string;
  check_out_date?: string;
  created_at: string;
  updated_at: string;
  project_name?: string;
  project_city?: string;
  house_street?: string;
  house_city?: string;
  house_number?: string;
  postal_code?: string;
  full_address?: string;
}

export interface CreateHousingUnitData {
  project_id: string;
  address: string;
  rooms_total: number;
  beds_total: number;
  occupied_beds?: number;
  rent_daily_eur: number;
  status: string;
  advance_payment?: number;
  check_in_date?: string;
  check_out_date?: string;
  owner_salutation?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
}

export interface UpdateHousingUnitData {
  id: string;
  address?: string;
  rooms_total?: number;
  beds_total?: number;
  occupied_beds?: number;
  rent_daily_eur?: number;
  status?: string;
  advance_payment?: number;
  check_in_date?: string;
  check_out_date?: string;
  owner_salutation?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
}

const api = {
  getHousingUnits: async (projectId: string): Promise<any[]> => {
    const response = await fetch(`/api/project-preparation/housing?project_id=${projectId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch housing units');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  createHousingUnit: async (data: CreateHousingUnitData): Promise<{ success: boolean; housing_unit_id: string; message: string }> => {
    const response = await fetch('/api/project-preparation/housing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create housing unit');
    }

    return response.json();
  },

  updateHousingUnit: async (data: UpdateHousingUnitData): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/project-preparation/housing/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update housing unit');
    }

    return response.json();
  },

  deleteHousingUnit: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`/api/project-preparation/housing/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete housing unit');
    }

    return response.json();
  },
};

export function useHousingUnits(projectId: string) {
  return useQuery({
    queryKey: ['housing-units', projectId],
    queryFn: () => api.getHousingUnits(projectId),
    enabled: !!projectId,
  });
}

export function useCreateHousingUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createHousingUnit,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['housing-units', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-preparation', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-costs', variables.project_id] });
      toast.success(data.message || 'Housing unit created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateHousingUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateHousingUnit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['housing-units'] });
      queryClient.invalidateQueries({ queryKey: ['project-preparation'] });
      queryClient.invalidateQueries({ queryKey: ['project-costs'] });
      toast.success(data.message || 'Housing unit updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteHousingUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteHousingUnit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['housing-units'] });
      queryClient.invalidateQueries({ queryKey: ['project-preparation'] });
      queryClient.invalidateQueries({ queryKey: ['project-costs'] });
      toast.success(data.message || 'Housing unit deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}