"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    planning: number;
    onHold: number;
  };
  workEntries: {
    total: number;
    pendingApprovals: number;
    approved: number;
    thisWeek: number;
  };
  team: {
    totalWorkers: number;
    activeWorkers: number;
    totalCrews: number;
    activeCrews: number;
  };
  materials: {
    totalMaterials: number;
    inStock: number;
    outOfStock: number;
    totalValue: number;
  };
  activities: {
    recentActivities: number;
  };
  lastUpdated: string;
  error?: string;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    role: string | null;
  } | null;
  time: string;
  created_at: string;
}

// Fetch dashboard statistics
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard statistics');
  }
  return response.json();
}

// Fetch recent activities
async function fetchRecentActivities(): Promise<RecentActivity[]> {
  const response = await fetch('/api/activities?page=1&per_page=10');
  if (!response.ok) {
    throw new Error('Failed to fetch recent activities');
  }
  const data = await response.json();
  return data.activities || [];
}

// Dashboard statistics hook with caching and real-time updates
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors, but retry on network errors
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 3;
    },
  });
}

// Recent activities hook
export function useRecentActivities() {
  return useQuery({
    queryKey: ['recent-activities'],
    queryFn: fetchRecentActivities,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook to manually refresh dashboard data
export function useDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshDashboard = async () => {
    // Invalidate and refetch dashboard statistics
    await queryClient.invalidateQueries({
      queryKey: ['dashboard-stats'],
      refetchType: 'active'
    });

    // Invalidate and refetch recent activities
    await queryClient.invalidateQueries({
      queryKey: ['recent-activities'],
      refetchType: 'active'
    });
  };

  return { refreshDashboard };
}

// Hook to get cached dashboard data without triggering a fetch
export function useCachedDashboardStats() {
  const queryClient = useQueryClient();

  const getCachedStats = () => {
    return queryClient.getQueryData<DashboardStats>(['dashboard-stats']);
  };

  const getCachedActivities = () => {
    return queryClient.getQueryData<RecentActivity[]>(['recent-activities']);
  };

  return { getCachedStats, getCachedActivities };
}