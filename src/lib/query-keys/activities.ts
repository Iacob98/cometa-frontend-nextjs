export interface ActivityFilters {
  user_id?: string;
  project_id?: string;
  activity_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: ActivityFilters) => [...activityKeys.lists(), filters] as const,
  stats: (filters: Omit<ActivityFilters, 'page' | 'per_page' | 'search'>) =>
    [...activityKeys.all, 'stats', filters] as const,
};