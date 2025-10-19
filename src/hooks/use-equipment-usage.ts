/**
 * Equipment Usage Logs Hooks
 * TanStack Query hooks for equipment usage tracking
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  EquipmentUsageLog,
  CreateUsageLogRequest,
  EquipmentUsageFilters,
  PaginatedResponse,
  UsageSummary,
} from '@/types/equipment-enhanced';

const API_BASE = '/api/equipment/usage';

// Query Keys
export const usageKeys = {
  all: ['equipment-usage'] as const,
  lists: () => [...usageKeys.all, 'list'] as const,
  list: (filters: EquipmentUsageFilters) =>
    [...usageKeys.lists(), filters] as const,
  summaries: () => [...usageKeys.all, 'summary'] as const,
  summary: (equipment_id: string, from_date?: string, to_date?: string) =>
    [...usageKeys.summaries(), equipment_id, from_date, to_date] as const,
};

// GET /api/equipment/usage
export function useEquipmentUsage(filters: EquipmentUsageFilters = {}) {
  return useQuery({
    queryKey: usageKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.equipment_id) params.append('equipment_id', filters.equipment_id);
      if (filters.assignment_id) params.append('assignment_id', filters.assignment_id);
      if (filters.work_entry_id) params.append('work_entry_id', filters.work_entry_id);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
      if (filters.logged_by_user_id) params.append('logged_by_user_id', filters.logged_by_user_id);

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment usage logs');
      }
      return response.json() as Promise<PaginatedResponse<EquipmentUsageLog>>;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// POST /api/equipment/usage
export function useLogEquipmentUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUsageLogRequest) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to log equipment usage');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all usage lists
      queryClient.invalidateQueries({ queryKey: usageKeys.lists() });

      // Invalidate equipment query (total_usage_hours changed)
      if (data.usage_log?.equipment_id) {
        queryClient.invalidateQueries({
          queryKey: ['equipment', data.usage_log.equipment_id],
        });
        queryClient.invalidateQueries({
          queryKey: ['equipment'],
        });
      }

      // Invalidate maintenance schedules (usage-based schedules might be due)
      queryClient.invalidateQueries({
        queryKey: ['equipment-maintenance-schedules'],
      });
    },
  });
}

// Helper: Get usage summary for equipment
export function useEquipmentUsageSummary(
  equipment_id: string | null,
  from_date?: string,
  to_date?: string
) {
  return useQuery({
    queryKey: usageKeys.summary(equipment_id || '', from_date, to_date),
    queryFn: async () => {
      if (!equipment_id) throw new Error('Equipment ID required');

      const params = new URLSearchParams({ equipment_id });
      if (from_date) params.append('from_date', from_date);
      if (to_date) params.append('to_date', to_date);

      const response = await fetch(`${API_BASE}/summary?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage summary');
      }
      return response.json() as Promise<UsageSummary>;
    },
    enabled: !!equipment_id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Helper: Get recent usage for equipment (last 30 days)
export function useRecentEquipmentUsage(equipment_id: string | null) {
  const to_date = new Date().toISOString().split('T')[0];
  const from_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return useEquipmentUsage({
    equipment_id: equipment_id || undefined,
    from_date,
    to_date,
  });
}

// Helper: Validate daily usage before logging
export function useValidateDailyUsage() {
  return useMutation({
    mutationFn: async ({
      equipment_id,
      usage_date,
      hours_to_add,
    }: {
      equipment_id: string;
      usage_date: string;
      hours_to_add: number;
    }) => {
      // Fetch existing usage for this date
      const params = new URLSearchParams({
        equipment_id,
        from_date: usage_date,
        to_date: usage_date,
      });

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to validate usage');
      }

      const data = await response.json() as PaginatedResponse<EquipmentUsageLog>;

      // Calculate total hours for the day
      const existingHours = data.items.reduce((sum, log) => sum + log.hours_used, 0);
      const totalHours = existingHours + hours_to_add;

      return {
        is_valid: totalHours <= 24,
        existing_hours: existingHours,
        total_hours: totalHours,
        remaining_hours: 24 - existingHours,
      };
    },
  });
}
