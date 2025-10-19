/**
 * Typed Equipment Views Hooks
 * Date: 2025-10-19
 * Purpose: React Query hooks for fetching type-specific equipment views
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type {
  EquipmentViewType,
  PowerToolView,
  FusionSplicerView,
  OTDRView,
  SafetyGearView,
  TypedEquipmentView,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

// Query keys for typed views
export const typedEquipmentViewKeys = {
  all: ['typed-equipment-views'] as const,
  list: (viewType: EquipmentViewType) => [...typedEquipmentViewKeys.all, 'list', viewType] as const,
  filtered: (viewType: EquipmentViewType, filters: Record<string, any>) =>
    [...typedEquipmentViewKeys.list(viewType), filters] as const,
};

interface TypedViewFilters {
  status?: string;
  owned?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

// Fetch typed equipment view
async function fetchTypedEquipmentView(
  viewType: Exclude<EquipmentViewType, 'all'>,
  filters: TypedViewFilters = {}
): Promise<PaginatedResponse<TypedEquipmentView>> {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.owned !== undefined) params.append('owned', String(filters.owned));
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.per_page) params.append('per_page', String(filters.per_page));

  const response = await fetch(`/api/equipment/typed-views/${viewType}?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to fetch ${viewType} view`);
  }

  return response.json();
}

/**
 * Hook to fetch power tools with type-specific fields
 */
export function usePowerToolsView(
  filters: TypedViewFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<PowerToolView>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: typedEquipmentViewKeys.filtered('power_tools', filters),
    queryFn: () => fetchTypedEquipmentView('power_tools', filters) as Promise<PaginatedResponse<PowerToolView>>,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch fusion splicers with type-specific fields
 */
export function useFusionSplicersView(
  filters: TypedViewFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<FusionSplicerView>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: typedEquipmentViewKeys.filtered('fusion_splicers', filters),
    queryFn: () => fetchTypedEquipmentView('fusion_splicers', filters) as Promise<PaginatedResponse<FusionSplicerView>>,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch OTDRs with type-specific fields
 */
export function useOTDRsView(
  filters: TypedViewFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<OTDRView>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: typedEquipmentViewKeys.filtered('otdrs', filters),
    queryFn: () => fetchTypedEquipmentView('otdrs', filters) as Promise<PaginatedResponse<OTDRView>>,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch safety gear with type-specific fields
 */
export function useSafetyGearView(
  filters: TypedViewFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<SafetyGearView>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: typedEquipmentViewKeys.filtered('safety_gear', filters),
    queryFn: () => fetchTypedEquipmentView('safety_gear', filters) as Promise<PaginatedResponse<SafetyGearView>>,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Generic hook to fetch any typed equipment view
 */
export function useTypedEquipmentView(
  viewType: Exclude<EquipmentViewType, 'all'>,
  filters: TypedViewFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<TypedEquipmentView>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: typedEquipmentViewKeys.filtered(viewType, filters),
    queryFn: () => fetchTypedEquipmentView(viewType, filters),
    staleTime: 2 * 60 * 1000,
    enabled: viewType !== 'all',
    ...options,
  });
}
