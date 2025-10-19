/**
 * Equipment Maintenance Schedules Hooks
 * TanStack Query hooks for preventive maintenance scheduling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  EquipmentMaintenanceSchedule,
  CreateMaintenanceScheduleRequest,
  MaintenanceScheduleFilters,
  OverdueMaintenanceItem,
  UpcomingMaintenanceItem,
} from '@/types/equipment-enhanced';

const API_BASE = '/api/equipment/maintenance-schedules';

// Query Keys
export const maintenanceScheduleKeys = {
  all: ['equipment-maintenance-schedules'] as const,
  lists: () => [...maintenanceScheduleKeys.all, 'list'] as const,
  list: (filters: MaintenanceScheduleFilters) =>
    [...maintenanceScheduleKeys.lists(), filters] as const,
  overdue: () => [...maintenanceScheduleKeys.all, 'overdue'] as const,
  upcoming: (days: number) => [...maintenanceScheduleKeys.all, 'upcoming', days] as const,
};

// GET /api/equipment/maintenance-schedules
export function useMaintenanceSchedules(filters: MaintenanceScheduleFilters = {}) {
  return useQuery({
    queryKey: maintenanceScheduleKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.equipment_id) params.append('equipment_id', filters.equipment_id);
      if (filters.maintenance_type) params.append('maintenance_type', filters.maintenance_type);
      if (filters.overdue_only !== undefined) params.append('overdue_only', String(filters.overdue_only));
      if (filters.upcoming_within_days) params.append('upcoming_within_days', String(filters.upcoming_within_days));
      if (filters.active_only !== undefined) params.append('active_only', String(filters.active_only));

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance schedules');
      }
      return response.json() as Promise<{
        items: EquipmentMaintenanceSchedule[];
        total: number;
      }>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// POST /api/equipment/maintenance-schedules
export function useCreateMaintenanceSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceScheduleRequest) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create maintenance schedule');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all schedule lists
      queryClient.invalidateQueries({ queryKey: maintenanceScheduleKeys.lists() });

      // Invalidate specific equipment's schedules
      if (data.schedule?.equipment_id) {
        queryClient.invalidateQueries({
          queryKey: maintenanceScheduleKeys.list({ equipment_id: data.schedule.equipment_id }),
        });
      }

      // Invalidate overdue/upcoming queries
      queryClient.invalidateQueries({ queryKey: maintenanceScheduleKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: maintenanceScheduleKeys.all });
    },
  });
}

// Helper: Get overdue maintenance
export function useOverdueMaintenance() {
  return useQuery({
    queryKey: maintenanceScheduleKeys.overdue(),
    queryFn: async () => {
      const params = new URLSearchParams({
        overdue_only: 'true',
        active_only: 'true',
      });

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch overdue maintenance');
      }

      const data = await response.json();
      return data.items as EquipmentMaintenanceSchedule[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}

// Helper: Get upcoming maintenance (next 30 days by default)
export function useUpcomingMaintenance(days: number = 30) {
  return useQuery({
    queryKey: maintenanceScheduleKeys.upcoming(days),
    queryFn: async () => {
      const params = new URLSearchParams({
        upcoming_within_days: String(days),
        active_only: 'true',
      });

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming maintenance');
      }

      const data = await response.json();
      return data.items as EquipmentMaintenanceSchedule[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper: Get maintenance schedule for specific equipment
export function useEquipmentMaintenanceSchedules(equipment_id: string | null) {
  return useMaintenanceSchedules({
    equipment_id: equipment_id || undefined,
    active_only: true,
  });
}

// Helper: Get overdue count (for badges)
export function useOverdueMaintenanceCount() {
  const { data } = useOverdueMaintenance();
  return data?.length || 0;
}

// Helper: Get upcoming count (for badges)
export function useUpcomingMaintenanceCount(days: number = 30) {
  const { data } = useUpcomingMaintenance(days);
  return data?.length || 0;
}
