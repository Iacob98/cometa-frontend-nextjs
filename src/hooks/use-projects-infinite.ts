/**
 * TANSTACK QUERY INFINITE PATTERNS
 *
 * Оптимизированные infinite queries для пагинации больших списков данных
 * Используют cursor-based pagination для максимальной производительности
 */

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  projectsApi,
  type Project,
  type ProjectFilters,
  type CreateProjectRequest,
  type PaginatedResponse,
} from "@/lib/api-client";

// OPTIMIZATION: Enhanced query keys with infinite support
export const infiniteProjectKeys = {
  all: ["projects", "infinite"] as const,
  lists: () => [...infiniteProjectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) => [...infiniteProjectKeys.lists(), filters] as const,
};

// OPTIMIZATION: Infinite Projects Hook with Cursor Pagination
export function useInfiniteProjects(
  filters?: ProjectFilters,
  pageSize: number = 20
) {
  return useInfiniteQuery({
    queryKey: infiniteProjectKeys.list(filters || {}),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await projectsApi.getProjects({
        ...filters,
        page: pageParam,
        per_page: pageSize,
      });
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse<Project>, allPages) => {
      // OPTIMIZATION: Cursor-based pagination for consistent performance
      if (!lastPage.has_more) return undefined;
      return allPages.length; // Use page number as cursor
    },
    getPreviousPageParam: (firstPage, allPages) => {
      return allPages.length > 1 ? allPages.length - 2 : undefined;
    },

    // OPTIMIZATION: Enhanced caching and refetch strategies
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,

    // OPTIMIZATION: Background refetch for long lists
    refetchInterval: (data, query) => {
      // Only background refetch first page for latest updates
      if (data?.pages.length === 1) {
        return 2 * 60 * 1000; // 2 minutes for first page
      }
      return false; // Don't background refetch for deep pages
    },

    // OPTIMIZATION: Intelligent placeholders
    placeholderData: (previousData) => previousData,
  });
}

// OPTIMIZATION: Smart prefetching hook for next pages
export function usePrefetchProjects() {
  const queryClient = useQueryClient();

  return {
    prefetchNextPage: async (filters?: ProjectFilters, currentPage = 0) => {
      const nextPage = currentPage + 1;

      await queryClient.prefetchQuery({
        queryKey: [...infiniteProjectKeys.list(filters || {}), nextPage],
        queryFn: () => projectsApi.getProjects({
          ...filters,
          page: nextPage,
          per_page: 20,
        }),
        staleTime: 5 * 60 * 1000,
      });
    },

    prefetchProjectDetails: async (projectId: string) => {
      await queryClient.prefetchQuery({
        queryKey: ["projects", "detail", projectId],
        queryFn: () => projectsApi.getProject(projectId),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}

// OPTIMIZATION: Optimized infinite list mutations with smart cache updates
export function useCreateProjectInfinite(filters?: ProjectFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.createProject(data),
    onSuccess: (newProject) => {
      // OPTIMIZATION: Smart cache update for infinite queries
      queryClient.setQueryData(
        infiniteProjectKeys.list(filters || {}),
        (oldData: any) => {
          if (!oldData?.pages?.length) return oldData;

          // Add to first page for immediate visibility
          const newPages = [...oldData.pages];
          newPages[0] = {
            ...newPages[0],
            items: [newProject, ...newPages[0].items],
            total: newPages[0].total + 1,
          };

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );

      // Add to individual cache
      queryClient.setQueryData(["projects", "detail", newProject.id], newProject);

      toast.success("Project created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });
}

// OPTIMIZATION: Memory-efficient data access helpers
export function useInfiniteProjectsData() {
  return {
    // Get all projects from infinite pages
    getAllProjects: (data?: any): Project[] => {
      if (!data?.pages) return [];
      return data.pages.flatMap((page: PaginatedResponse<Project>) => page.items || []);
    },

    // Get total count across all pages
    getTotalCount: (data?: any): number => {
      return data?.pages?.[0]?.total || 0;
    },

    // Check if more data is available
    hasMoreData: (data?: any, hasNextPage?: boolean): boolean => {
      return hasNextPage && data?.pages?.length > 0;
    },

    // Get loading states for different scenarios
    getLoadingStates: (
      isLoading: boolean,
      isFetchingNextPage: boolean,
      isRefetching: boolean
    ) => ({
      isInitialLoading: isLoading,
      isLoadingMore: isFetchingNextPage,
      isRefreshing: isRefetching && !isFetchingNextPage,
    }),
  };
}

// OPTIMIZATION: Virtual scrolling preparation hook
export function useVirtualizedProjects(filters?: ProjectFilters) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteProjects(filters);

  const { getAllProjects, getTotalCount, getLoadingStates } = useInfiniteProjectsData();

  const projects = getAllProjects(data);
  const totalCount = getTotalCount(data);
  const loadingStates = getLoadingStates(isLoading, isFetchingNextPage, false);

  return {
    projects,
    totalCount,
    hasNextPage,
    fetchNextPage,
    ...loadingStates,
    error,

    // OPTIMIZATION: Virtual scrolling helpers
    loadMoreItems: async (startIndex: number, stopIndex: number) => {
      const currentItemCount = projects.length;
      if (stopIndex >= currentItemCount - 5 && hasNextPage && !isFetchingNextPage) {
        await fetchNextPage();
      }
    },

    // Check if item is loaded
    isItemLoaded: (index: number) => index < projects.length,
  };
}