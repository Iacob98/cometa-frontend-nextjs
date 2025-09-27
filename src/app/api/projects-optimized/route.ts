/**
 * OPTIMIZED PROJECTS API ROUTE
 *
 * TDD IMPLEMENTATION: Заменяет docker exec psql подход на оптимизированные Supabase запросы
 * ЦЕЛЬ: Устранить N+1 проблему, улучшить performance с <100ms response time
 *
 * NO MOCKS - только реальная Supabase интеграция
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProjectsWithProgressOptimized, getProjectsWithProgressSuperOptimized, getProjectsWithProgressRPC } from '@/lib/supabase-optimized-queries';
import { unstable_cache } from 'next/cache';

// Enable caching for GET requests with 5-minute TTL
export const revalidate = 300; // 5 minutes

// Cached version using Context7 best practices with multiple fallback strategies
const getCachedProjectsWithProgress = unstable_cache(
  async () => {
    console.log('🎯 Starting optimized query with Context7 fallback strategy');

    // STRATEGY 1: Try RPC function first (Context7 recommended approach)
    try {
      console.log('🚀 Attempting RPC function approach');
      return await getProjectsWithProgressRPC();
    } catch (rpcError) {
      console.log('⚠️ RPC failed, trying super optimized approach', rpcError);

      // STRATEGY 2: Fallback to super optimized
      try {
        return await getProjectsWithProgressSuperOptimized();
      } catch (superError) {
        console.log('⚠️ Super optimized failed, falling back to regular optimized', superError);

        // STRATEGY 3: Final fallback to regular optimized
        return await getProjectsWithProgressOptimized();
      }
    }
  },
  ['projects-with-progress-v2'], // Updated cache key
  {
    revalidate: 300, // 5 minutes
    tags: ['projects', 'work-entries', 'rpc-optimized']
  }
);

export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    console.log('🚀 OPTIMIZED API ROUTE - Starting request');

    // Use cached optimized query
    const { data: projects, error, executionTime } = await getCachedProjectsWithProgress();

    const totalTime = performance.now() - startTime;

    // Log performance metrics
    console.log(`📊 OPTIMIZED API ROUTE Performance:`);
    console.log(`  - Database query time: ${executionTime}ms`);
    console.log(`  - Total response time: ${totalTime}ms`);
    console.log(`  - Projects returned: ${projects?.length || 0}`);
    console.log(`  - Cache status: ${request.headers.get('cache-control') || 'default'}`);

    if (error) {
      console.error('❌ OPTIMIZED API ROUTE Error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch projects',
          details: process.env.NODE_ENV === 'development' ? error : undefined
        },
        { status: 500 }
      );
    }

    // Set performance headers for monitoring
    const response = NextResponse.json({
      data: projects || [],
      metadata: {
        count: projects?.length || 0,
        executionTime,
        totalTime,
        cached: true,
        optimized: true,
        timestamp: new Date().toISOString()
      }
    });

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('X-Database-Time', `${executionTime}ms`);
    response.headers.set('X-Total-Time', `${totalTime}ms`);
    response.headers.set('X-Optimized', 'true');

    console.log('✅ OPTIMIZED API ROUTE Success');
    return response;

  } catch (error) {
    const totalTime = performance.now() - startTime;

    console.error('❌ OPTIMIZED API ROUTE Fatal Error:', error);
    console.log(`💥 Failed after: ${totalTime}ms`);

    return NextResponse.json(
      {
        error: 'Internal server error',
        metadata: {
          totalTime,
          optimized: false,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Manual revalidation endpoint for cache invalidation
 * Usage: POST /api/projects-optimized with { "revalidate": true }
 */
export async function POST(request: NextRequest) {
  try {
    const { revalidate } = await request.json();

    if (revalidate) {
      const { revalidateTag } = await import('next/cache');

      // Invalidate cache tags
      revalidateTag('projects');
      revalidateTag('work-entries');

      console.log('🔄 CACHE INVALIDATED - Projects cache revalidated');

      return NextResponse.json({
        success: true,
        message: 'Cache invalidated successfully',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid request - missing revalidate parameter'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ CACHE REVALIDATION Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to revalidate cache'
    }, { status: 500 });
  }
}

/**
 * Health check endpoint
 * Usage: GET /api/projects-optimized?health=true
 */
export async function OPTIONS(request: NextRequest) {
  const url = new URL(request.url);
  const isHealthCheck = url.searchParams.get('health') === 'true';

  if (isHealthCheck) {
    const startTime = performance.now();

    try {
      // Quick health check using RPC function for best performance
      const { error } = await getProjectsWithProgressRPC();
      const responseTime = performance.now() - startTime;

      return NextResponse.json({
        status: 'healthy',
        optimized: true,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        services: {
          supabase: error ? 'error' : 'healthy',
          cache: 'enabled'
        }
      });

    } catch (error) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'Service check failed',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
  }

  return NextResponse.json({
    methods: ['GET', 'POST', 'OPTIONS'],
    description: 'Optimized Projects API with Supabase integration'
  });
}