/**
 * TANSTACK QUERY PREFETCHING STRATEGIES
 *
 * Интеллектуальные стратегии prefetching для улучшения UX
 * Предзагрузка данных на основе пользовательского поведения
 */

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import {
  projectsApi,
  workEntriesApi,
  materialsApi,
  usersApi,
  type Project,
} from "@/lib/api-client";
import { projectKeys } from "./use-projects";

// OPTIMIZATION: Smart prefetching based on user behavior
export function usePrefetchStrategies() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // CRITICAL: Prefetch related data when hovering over links
  const prefetchProjectDetails = useCallback(async (projectId: string) => {
    // Prefetch project details
    await queryClient.prefetchQuery({
      queryKey: projectKeys.detail(projectId),
      queryFn: () => projectsApi.getProject(projectId),
      staleTime: 5 * 60 * 1000,
    });

    // OPTIMIZATION: Prefetch related data in parallel
    await Promise.all([
      // Project statistics
      queryClient.prefetchQuery({
        queryKey: [...projectKeys.detail(projectId), "stats"],
        queryFn: async () => {
          const response = await fetch(`/api/projects/${projectId}/stats`);
          return response.json();
        },
        staleTime: 2 * 60 * 1000,
      }),

      // Work entries for project
      queryClient.prefetchQuery({
        queryKey: ["work-entries", "list", { project_id: projectId }],
        queryFn: () => workEntriesApi.getWorkEntries({ project_id: projectId }),
        staleTime: 3 * 60 * 1000,
      }),

      // Project team members
      queryClient.prefetchQuery({
        queryKey: ["users", "project", projectId],
        queryFn: async () => {
          const response = await fetch(`/api/projects/${projectId}/team`);
          return response.json();
        },
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  }, [queryClient]);

  // OPTIMIZATION: Prefetch dashboard data
  const prefetchDashboardData = useCallback(async () => {
    await Promise.all([
      // Recent projects
      queryClient.prefetchQuery({
        queryKey: projectKeys.list({ status: 'active', limit: 10 }),
        queryFn: () => projectsApi.getProjects({ status: 'active', limit: 10 }),
        staleTime: 5 * 60 * 1000,
      }),

      // Recent work entries
      queryClient.prefetchQuery({
        queryKey: ["work-entries", "recent"],
        queryFn: () => workEntriesApi.getWorkEntries({ limit: 20 }),
        staleTime: 2 * 60 * 1000,
      }),

      // Dashboard statistics
      queryClient.prefetchQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: async () => {
          const response = await fetch('/api/dashboard/stats');
          return response.json();
        },
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  }, [queryClient]);

  // OPTIMIZATION: Prefetch navigation-based data
  const prefetchNavigationData = useCallback(async (path: string) => {
    const segments = path.split('/');
    const section = segments[2]; // /dashboard/{section}

    switch (section) {
      case 'projects':
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: projectKeys.lists(),
            queryFn: () => projectsApi.getProjects({ page: 0, per_page: 20 }),
            staleTime: 5 * 60 * 1000,
          }),
          // Prefetch project statistics for active projects
          queryClient.prefetchQuery({
            queryKey: ["dashboard", "project-overview"],
            queryFn: async () => {
              const response = await fetch('/api/dashboard/projects-overview');
              return response.json();
            },
            staleTime: 5 * 60 * 1000,
          }),
        ]);
        break;

      case 'materials':
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ["materials", "list"],
            queryFn: () => materialsApi.getMaterials(),
            staleTime: 10 * 60 * 1000, // Materials change less frequently
          }),
          queryClient.prefetchQuery({
            queryKey: ["materials", "inventory-overview"],
            queryFn: async () => {
              const response = await fetch('/api/materials/inventory-overview');
              return response.json();
            },
            staleTime: 5 * 60 * 1000,
          }),
        ]);
        break;

      case 'teams':
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ["crews", "list"],
            queryFn: async () => {
              const response = await fetch('/api/crews');
              return response.json();
            },
            staleTime: 10 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ["users", "list"],
            queryFn: () => usersApi.getUsers(),
            staleTime: 10 * 60 * 1000,
          }),
        ]);
        break;

      case 'work-entries':
        await queryClient.prefetchQuery({
          queryKey: ["work-entries", "list"],
          queryFn: () => workEntriesApi.getWorkEntries({ page: 0, per_page: 20 }),
          staleTime: 2 * 60 * 1000,
        });
        break;
    }
  }, [queryClient]);

  return {
    prefetchProjectDetails,
    prefetchDashboardData,
    prefetchNavigationData,
  };
}

// OPTIMIZATION: React component prefetching hook
export function useComponentPrefetch() {
  const { prefetchProjectDetails, prefetchDashboardData, prefetchNavigationData } =
    usePrefetchStrategies();

  return {
    // Mouse enter prefetching for links
    onProjectHover: (projectId: string) => {
      prefetchProjectDetails(projectId);
    },

    // Route change prefetching
    onRouteChange: (path: string) => {
      prefetchNavigationData(path);
    },

    // Dashboard mount prefetching
    onDashboardMount: () => {
      prefetchDashboardData();
    },
  };
}

// OPTIMIZATION: Intersection Observer prefetching
export function useIntersectionPrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const projectId = element.dataset.projectId;
            const prefetchType = element.dataset.prefetchType;

            if (projectId && prefetchType === 'project-details') {
              // Prefetch project details when card is 50% visible
              queryClient.prefetchQuery({
                queryKey: projectKeys.detail(projectId),
                queryFn: () => projectsApi.getProject(projectId),
                staleTime: 5 * 60 * 1000,
              });
            }
          }
        });
      },
      {
        rootMargin: '100px', // Start prefetching 100px before element is visible
        threshold: 0.5, // Trigger when 50% visible
      }
    );

    // Find all elements with data-project-id and start observing
    const prefetchElements = document.querySelectorAll('[data-project-id][data-prefetch-type]');
    prefetchElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [queryClient]);
}

// OPTIMIZATION: Background sync for offline support
export function useBackgroundSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncCriticalData = async () => {
      // Only sync when online and app is visible
      if (!navigator.onLine || document.hidden) return;

      try {
        // Background refresh of critical data
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: projectKeys.lists(),
            refetchType: 'none', // Don't trigger loading states
          }),
          queryClient.invalidateQueries({
            queryKey: ["dashboard", "stats"],
            refetchType: 'none',
          }),
          queryClient.invalidateQueries({
            queryKey: ["work-entries", "recent"],
            refetchType: 'none',
          }),
        ]);
      } catch (error) {
        console.warn('Background sync failed:', error);
      }
    };

    // Sync every 5 minutes when app is active
    const syncInterval = setInterval(syncCriticalData, 5 * 60 * 1000);

    // Sync when app becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncCriticalData();
      }
    };

    // Sync when network comes back online
    const handleOnline = () => {
      syncCriticalData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient]);
}

// OPTIMIZATION: Optimistic UI patterns
export function useOptimisticPatterns() {
  const queryClient = useQueryClient();

  return {
    // Optimistic project status update
    updateProjectStatusOptimistic: (projectId: string, newStatus: string) => {
      queryClient.setQueryData(
        projectKeys.detail(projectId),
        (old: Project | undefined) => {
          if (!old) return old;
          return { ...old, status: newStatus, updated_at: new Date().toISOString() };
        }
      );

      // Also update in lists
      queryClient.setQueriesData(
        { queryKey: projectKeys.lists() },
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((project: Project) =>
              project.id === projectId
                ? { ...project, status: newStatus, updated_at: new Date().toISOString() }
                : project
            ),
          };
        }
      );
    },

    // Optimistic work entry creation
    addWorkEntryOptimistic: (workEntry: any) => {
      const optimisticEntry = {
        ...workEntry,
        id: `temp_${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'pending',
      };

      queryClient.setQueryData(
        ["work-entries", "list"],
        (old: any) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: [optimisticEntry, ...old.items],
            total: old.total + 1,
          };
        }
      );

      return optimisticEntry.id;
    },

    // Revert optimistic update
    revertOptimisticUpdate: (queryKey: any[]) => {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}