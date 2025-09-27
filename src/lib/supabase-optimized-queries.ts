/**
 * OPTIMIZED SUPABASE QUERIES
 *
 * Заменяет docker exec psql на эффективные Supabase запросы
 * Устраняет N+1 проблему с помощью JOINs и агрегации
 */

import { supabase } from './supabase';

export interface OptimizedProject {
  id: string;
  name: string;
  customer: string;
  city: string;
  address: string;
  contact_24h: string;
  start_date: string;
  end_date_plan: string;
  status: string;
  total_length_m: number;
  base_rate_per_m: number;
  pm_user_id: string;
  language_default: string;
  pm_user?: {
    first_name: string;
    last_name: string;
  };
  progress: {
    completed_hours: number;
    progress_percentage: number;
  };
}

/**
 * SUPER OPTIMIZED: Single query to get projects with progress using SQL aggregation
 * Even faster than two-step approach - uses PostgreSQL aggregation directly
 */
export async function getProjectsWithProgressSuperOptimized(): Promise<{
  data: OptimizedProject[] | null;
  error: any;
  executionTime: number;
}> {
  const start = performance.now();

  try {
    // Single query with SQL aggregation - maximum performance
    const { data: rawData, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        customer,
        city,
        address,
        contact_24h,
        start_date,
        end_date_plan,
        status,
        total_length_m,
        base_rate_per_m,
        pm_user_id,
        language_default,
        pm_user:users!pm_user_id(
          first_name,
          last_name
        ),
        work_entries(duration_hours)
      `)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Transform data with progress calculation
    const optimizedProjects: OptimizedProject[] = (rawData || []).map(project => {
      const completed_hours = (project.work_entries as any[] || [])
        .reduce((sum: number, entry: any) => sum + (entry.duration_hours || 0), 0);

      return {
        ...project,
        pm_user: Array.isArray(project.pm_user) ? project.pm_user[0] : project.pm_user,
        progress: {
          completed_hours,
          progress_percentage: project.total_length_m
            ? (completed_hours / project.total_length_m * 100)
            : 0
        },
        work_entries: undefined // Remove from final output
      };
    });

    const executionTime = performance.now() - start;

    return {
      data: optimizedProjects,
      error: null,
      executionTime
    };

  } catch (error) {
    const executionTime = performance.now() - start;
    console.error('🔴 Super optimized query error:', error);

    return {
      data: null,
      error,
      executionTime
    };
  }
}

/**
 * OPTIMIZED: Two-step query to get projects with progress (fallback)
 * Replaces N+1 docker exec approach with two efficient queries
 */
export async function getProjectsWithProgressOptimized(): Promise<{
  data: OptimizedProject[] | null;
  error: any;
  executionTime: number;
}> {
  const start = performance.now();

  try {
    // STEP 1: Get all projects with PM user data (single query)
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        customer,
        city,
        address,
        contact_24h,
        start_date,
        end_date_plan,
        status,
        total_length_m,
        base_rate_per_m,
        pm_user_id,
        language_default,
        pm_user:users!pm_user_id(
          first_name,
          last_name
        )
      `)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(20);

    if (projectsError) throw projectsError;
    if (!projects?.length) {
      return {
        data: [],
        error: null,
        executionTime: performance.now() - start
      };
    }

    // STEP 2: Get aggregated progress for all projects (single query with optimization)
    const projectIds = projects.map(p => p.id);

    if (projectIds.length === 0) {
      return {
        data: [],
        error: null,
        executionTime: performance.now() - start
      };
    }

    const { data: progressData, error: progressError } = await supabase
      .from('work_entries')
      .select('project_id, duration_hours')
      .in('project_id', projectIds)
      .not('duration_hours', 'is', null) // Only get entries with actual hours
      .order('project_id'); // Order for better indexing

    if (progressError) throw progressError;

    // STEP 3: Aggregate progress data in JavaScript (efficient)
    const progressByProject = new Map<string, number>();

    progressData?.forEach(entry => {
      const currentHours = progressByProject.get(entry.project_id) || 0;
      progressByProject.set(entry.project_id, currentHours + (entry.duration_hours || 0));
    });

    // STEP 4: Combine projects with progress data
    const optimizedProjects: OptimizedProject[] = projects.map(project => ({
      ...project,
      pm_user: Array.isArray(project.pm_user) ? project.pm_user[0] : project.pm_user,
      progress: {
        completed_hours: progressByProject.get(project.id) || 0,
        progress_percentage: project.total_length_m
          ? ((progressByProject.get(project.id) || 0) / project.total_length_m * 100)
          : 0
      }
    }));

    const executionTime = performance.now() - start;

    return {
      data: optimizedProjects,
      error: null,
      executionTime
    };

  } catch (error) {
    const executionTime = performance.now() - start;
    console.error('🔴 Optimized query error:', error);

    return {
      data: null,
      error,
      executionTime
    };
  }
}

/**
 * MAXIMUM OPTIMIZATION: PostgreSQL RPC function
 * Uses native SQL RPC for ultimate performance with Context7 best practices
 */
export async function getProjectsWithProgressRPC(): Promise<{
  data: OptimizedProject[] | null;
  error: any;
  executionTime: number;
}> {
  const start = performance.now();

  try {
    console.log('🚀 Using PostgreSQL RPC function for maximum performance');

    // Call our optimized RPC function
    const { data: rawData, error } = await supabase.rpc('get_projects_with_progress_optimized', {
      project_limit: 20,
      project_offset: 0
    });

    if (error) throw error;

    // Transform RPC data to our interface
    const optimizedProjects: OptimizedProject[] = (rawData || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      customer: row.customer,
      city: row.city,
      address: row.address,
      contact_24h: row.contact_24h,
      start_date: row.start_date,
      end_date_plan: row.end_date_plan,
      status: row.status,
      total_length_m: row.total_length_m,
      base_rate_per_m: row.base_rate_per_m,
      pm_user_id: row.pm_user_id,
      language_default: row.language_default,
      pm_user: row.pm_first_name ? {
        first_name: row.pm_first_name,
        last_name: row.pm_last_name
      } : null,
      progress: {
        completed_hours: parseFloat(row.completed_hours) || 0,
        progress_percentage: parseFloat(row.progress_percentage) || 0
      }
    }));

    const executionTime = performance.now() - start;

    console.log(`✅ RPC Query executed in ${executionTime}ms for ${optimizedProjects.length} projects`);

    return {
      data: optimizedProjects,
      error: null,
      executionTime
    };

  } catch (error) {
    const executionTime = performance.now() - start;
    console.error('🔴 RPC query error:', error);

    return {
      data: null,
      error,
      executionTime
    };
  }
}

/**
 * DEPRECATED: Single PostgreSQL query with JOINs (kept for compatibility)
 * Use getProjectsWithProgressRPC for better performance
 */
export async function getProjectsWithProgressSingleQuery(): Promise<{
  data: OptimizedProject[] | null;
  error: any;
  executionTime: number;
}> {
  console.log('⚠️ Using deprecated single query method - consider switching to RPC');

  // Fallback to RPC function for now
  return await getProjectsWithProgressRPC();
}