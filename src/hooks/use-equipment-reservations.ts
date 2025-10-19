/**
 * Equipment Reservations Hooks
 * TanStack Query hooks for equipment reservations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  EquipmentReservation,
  CreateEquipmentReservationRequest,
  EquipmentReservationFilters,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

const API_BASE = '/api/equipment/reservations';

// Query Keys
export const reservationKeys = {
  all: ['equipment-reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (filters: EquipmentReservationFilters) =>
    [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
};

// GET /api/equipment/reservations
export function useEquipmentReservations(filters: EquipmentReservationFilters = {}) {
  return useQuery({
    queryKey: reservationKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.equipment_id) params.append('equipment_id', filters.equipment_id);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.reserved_by_user_id) params.append('reserved_by_user_id', filters.reserved_by_user_id);
      if (filters.active_only !== undefined) params.append('active_only', String(filters.active_only));
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment reservations');
      }
      return response.json() as Promise<PaginatedResponse<EquipmentReservation>>;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// POST /api/equipment/reservations
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEquipmentReservationRequest) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create reservation');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all reservation lists
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      // Also invalidate equipment queries (availability might change)
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// DELETE /api/equipment/reservations/[id]
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      const response = await fetch(`${API_BASE}/${reservationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel reservation');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all reservation lists
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      // Also invalidate equipment queries (availability might change)
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// Helper: Check equipment availability for a time period
export function useCheckEquipmentAvailability() {
  return useMutation({
    mutationFn: async ({
      equipment_id,
      from_date,
      to_date,
    }: {
      equipment_id: string;
      from_date: string;
      to_date: string;
    }) => {
      // Check for overlapping reservations
      const params = new URLSearchParams({
        equipment_id,
        from_date,
        to_date,
        active_only: 'true',
      });

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      const data = await response.json() as PaginatedResponse<EquipmentReservation>;

      return {
        is_available: data.total === 0,
        conflicts: data.items,
      };
    },
  });
}
