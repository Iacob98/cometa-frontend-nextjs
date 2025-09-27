/**
 * SUSPENSE-OPTIMIZED DATA FETCHING HOOKS
 *
 * React 19 Suspense integration for data fetching
 * Provides automatic loading states and error boundaries
 */

'use client';

import { useQuery, useSuspenseQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';

interface SuspenseQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

interface SuspenseProjectsResult {
  projects: Array<{
    id: string;
    name: string;
    status: string;
    start_date: string;
    budget?: number;
    progress_percentage?: number;
  }>;
  total: number;
  page: number;
  hasMore: boolean;
}

interface SuspenseMaterialsResult {
  materials: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    quantity_in_stock: number;
    unit_price: number;
    status: string;
  }>;
  total: number;
  page: number;
}

// OPTIMIZATION: Generic Suspense hook with performance optimizations
export function useSuspenseData<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  gcTime = 10 * 60 * 1000,   // 10 minutes
  enabled = true,
  refetchOnWindowFocus = false,
}: SuspenseQueryOptions<T>) {
  return useSuspenseQuery<T>({
    queryKey,
    queryFn,
    staleTime,
    gcTime,
    enabled,
    refetchOnWindowFocus,
  });
}

// OPTIMIZATION: Projects data with Suspense
export function useSuspenseProjects(page = 1, limit = 10, filters?: Record<string, any>) {
  const queryKey = useMemo(
    () => ['suspense-projects', { page, limit, filters }] as const,
    [page, limit, filters]
  );

  const queryFn = useCallback(async (): Promise<SuspenseProjectsResult> => {
    // Simulate API call
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));

    const projects = Array.from({ length: limit }, (_, i) => ({
      id: `${page}-${i + 1}`,
      name: `Project ${page}-${i + 1}`,
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'planning' : 'completed',
      start_date: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
      budget: (i + 1) * 10000,
      progress_percentage: Math.floor(Math.random() * 100),
    }));

    return {
      projects,
      total: 100,
      page,
      hasMore: page < 10,
    };
  }, [page, limit, filters]);

  return useSuspenseData({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000, // 2 minutes for projects
  });
}

// OPTIMIZATION: Materials data with Suspense
export function useSuspenseMaterials(page = 1, limit = 20, search?: string) {
  const queryKey = useMemo(
    () => ['suspense-materials', { page, limit, search }] as const,
    [page, limit, search]
  );

  const queryFn = useCallback(async (): Promise<SuspenseMaterialsResult> => {
    // Simulate API call with search delay
    const delay = search ? Math.random() * 800 + 300 : Math.random() * 600 + 200;
    await new Promise(resolve => setTimeout(resolve, delay));

    const materials = Array.from({ length: limit }, (_, i) => ({
      id: `mat-${page}-${i + 1}`,
      name: search
        ? `${search} Material ${i + 1}`
        : `Material ${page}-${i + 1}`,
      sku: `SKU-${page}${String(i + 1).padStart(3, '0')}`,
      category: ['Cables', 'Connectors', 'Tools', 'Safety'][i % 4],
      quantity_in_stock: Math.floor(Math.random() * 1000) + 10,
      unit_price: (Math.random() * 100 + 10),
      status: i % 5 === 0 ? 'low-stock' : i % 10 === 0 ? 'out-of-stock' : 'available',
    }));

    return {
      materials: search
        ? materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
        : materials,
      total: search ? 25 : 200,
      page,
    };
  }, [page, limit, search]);

  return useSuspenseData({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes for materials
  });
}

// OPTIMIZATION: Dashboard stats with Suspense
export function useSuspenseDashboardStats() {
  const queryKey = ['suspense-dashboard-stats'] as const;

  const queryFn = useCallback(async () => {
    // Simulate dashboard API call
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      totalProjects: 47,
      activeProjects: 23,
      completedProjects: 18,
      totalTeamMembers: 156,
      activeWorkEntries: 89,
      monthlyBudget: 2450000,
      monthlySpent: 1890000,
      efficiency: 92.5,
      recentActivity: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: ['project_created', 'work_completed', 'material_ordered'][i % 3],
        description: `Activity ${i + 1}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        user: `User ${i + 1}`,
      })),
    };
  }, []);

  return useSuspenseData({
    queryKey,
    queryFn,
    staleTime: 1 * 60 * 1000, // 1 minute for dashboard
  });
}

// OPTIMIZATION: Team data with Suspense
export function useSuspenseTeam(projectId?: string) {
  const queryKey = useMemo(
    () => ['suspense-team', { projectId }] as const,
    [projectId]
  );

  const queryFn = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const teamSize = projectId ? Math.floor(Math.random() * 15) + 5 : 30;

    return {
      teamMembers: Array.from({ length: teamSize }, (_, i) => ({
        id: i + 1,
        name: `Team Member ${i + 1}`,
        role: ['admin', 'pm', 'foreman', 'crew', 'worker'][i % 5],
        email: `member${i + 1}@cometa.de`,
        avatar: `https://i.pravatar.cc/150?u=${i + 1}`,
        isActive: Math.random() > 0.1,
        lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString(),
      })),
      totalMembers: teamSize,
      activeMembers: Math.floor(teamSize * 0.9),
    };
  }, [projectId]);

  return useSuspenseData({
    queryKey,
    queryFn,
    staleTime: 3 * 60 * 1000, // 3 minutes for team data
  });
}

// OPTIMIZATION: Optimistic update mutations with Suspense integration
export function useSuspenseMutations() {
  const queryClient = useQueryClient();

  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Record<string, any> }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...data.updates, id: data.id };
    },
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['suspense-projects'] });

      const previousProjects = queryClient.getQueriesData({ queryKey: ['suspense-projects'] });

      queryClient.setQueriesData(
        { queryKey: ['suspense-projects'] },
        (old: any) => {
          if (!old?.projects) return old;

          return {
            ...old,
            projects: old.projects.map((project: any) =>
              project.id === newData.id ? { ...project, ...newData.updates } : project
            ),
          };
        }
      );

      return { previousProjects };
    },
    onError: (err, newData, context) => {
      // Revert optimistic update on error
      if (context?.previousProjects) {
        context.previousProjects.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['suspense-projects'] });
    },
  });

  const createMaterialMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return { ...data, id: `mat-${Date.now()}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suspense-materials'] });
    },
  });

  return {
    updateProject: updateProjectMutation,
    createMaterial: createMaterialMutation,
  };
}

// OPTIMIZATION: Prefetch utility for better UX
export function useSuspensePrefetch() {
  const queryClient = useQueryClient();

  const prefetchProjects = useCallback((page: number = 1) => {
    queryClient.prefetchQuery({
      queryKey: ['suspense-projects', { page, limit: 10 }],
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));

        return {
          projects: Array.from({ length: 10 }, (_, i) => ({
            id: `${page}-${i + 1}`,
            name: `Project ${page}-${i + 1}`,
            status: 'active',
            start_date: new Date().toISOString(),
          })),
          total: 100,
          page,
          hasMore: page < 10,
        };
      },
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchMaterials = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['suspense-materials', { page: 1, limit: 20 }],
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 250));

        return {
          materials: Array.from({ length: 20 }, (_, i) => ({
            id: `mat-${i + 1}`,
            name: `Material ${i + 1}`,
            sku: `SKU-${String(i + 1).padStart(3, '0')}`,
            category: 'Cables',
            quantity_in_stock: 100,
            unit_price: 25.99,
            status: 'available',
          })),
          total: 200,
          page: 1,
        };
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchProjects,
    prefetchMaterials,
  };
}

export type {
  SuspenseProjectsResult,
  SuspenseMaterialsResult,
  SuspenseQueryOptions,
};