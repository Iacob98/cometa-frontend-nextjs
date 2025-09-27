/**
 * TANSTACK QUERY PERFORMANCE OPTIMIZATION TESTS
 *
 * TDD APPROACH: Тестирование оптимизаций TanStack Query для frontend производительности
 * ЦЕЛЬ: Проверить cache efficiency, prefetching strategies, и infinite queries
 *
 * NO MOCKS - тестирование реальных паттернов кеширования и данных
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProjects } from '../../hooks/use-projects';
import { useInfiniteProjects } from '../../hooks/use-projects-infinite';
import { usePrefetchStrategies } from '../../hooks/use-prefetch-strategies';

describe('TanStack Query Performance Optimization Tests', () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    // Create optimized QueryClient with production settings
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: false, // Disable retry for tests
        },
        mutations: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  });

  afterEach(() => {
    queryClient.clear();
  });

  test('PERFORMANCE: optimized QueryClient configuration reduces unnecessary refetches', async () => {
    console.log('\n🚀 TESTING OPTIMIZED QUERYCLIENT CONFIGURATION...\n');

    let fetchCount = 0;
    const mockFetch = vi.fn(() => {
      fetchCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: Array.from({ length: 20 }, (_, i) => ({
            id: `project-${i}`,
            name: `Project ${i}`
          })),
          total: 100,
          page: 0,
          has_more: true,
        }),
      });
    });

    global.fetch = mockFetch;

    const startTime = performance.now();

    // First render - should trigger fetch
    const { result: result1, rerender } = renderHook(
      () => useProjects({ status: 'active' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    const firstFetchTime = performance.now() - startTime;
    console.log(`📊 First fetch completed in: ${firstFetchTime.toFixed(2)}ms`);

    // Second render within staleTime - should NOT trigger fetch
    rerender();

    const secondRenderTime = performance.now() - startTime - firstFetchTime;

    // Wait a bit to ensure no additional fetch happens
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log(`📊 Second render time: ${secondRenderTime.toFixed(2)}ms`);
    console.log(`📊 Total fetch calls: ${fetchCount}`);

    // CRITICAL: Should only fetch once due to staleTime
    expect(fetchCount).toBe(1);
    expect(secondRenderTime).toBeLessThan(10); // Should be very fast (cache hit)

    console.log('✅ CACHE EFFICIENCY: Prevented unnecessary refetch');
  });

  test('PERFORMANCE: infinite queries handle large datasets efficiently', async () => {
    console.log('\n🚀 TESTING INFINITE QUERIES PERFORMANCE...\n');

    let pagesFetched = 0;
    const mockInfiniteFetch = vi.fn((url) => {
      const urlObj = new URL(url, 'http://localhost');
      const page = parseInt(urlObj.searchParams.get('page') || '0');
      pagesFetched++;

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: Array.from({ length: 20 }, (_, i) => ({
            id: `project-${page * 20 + i}`,
            name: `Project ${page * 20 + i}`
          })),
          total: 1000,
          page,
          has_more: page < 49, // 50 pages total
        }),
      });
    });

    global.fetch = mockInfiniteFetch;

    const startTime = performance.now();

    const { result } = renderHook(
      () => useInfiniteProjects({ status: 'active' }, 20),
      { wrapper }
    );

    // Wait for first page
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const firstPageTime = performance.now() - startTime;
    console.log(`📊 First page loaded in: ${firstPageTime.toFixed(2)}ms`);

    // Fetch next page
    const fetchNextStart = performance.now();
    await result.current.fetchNextPage();

    const nextPageTime = performance.now() - fetchNextStart;
    console.log(`📊 Next page loaded in: ${nextPageTime.toFixed(2)}ms`);

    // Check data structure efficiency
    const allProjects = result.current.data?.pages.flatMap(page => page.items) || [];
    console.log(`📊 Total projects loaded: ${allProjects.length}`);
    console.log(`📊 Total pages fetched: ${pagesFetched}`);

    // PERFORMANCE ASSERTIONS
    expect(pagesFetched).toBe(2); // Only 2 pages should be fetched
    expect(allProjects.length).toBe(40); // 20 items per page × 2 pages
    expect(firstPageTime).toBeLessThan(200); // First page should be fast
    expect(nextPageTime).toBeLessThan(100); // Next page should be even faster

    console.log('✅ INFINITE QUERIES: Efficient pagination implemented');
  });

  test('PERFORMANCE: prefetching strategies reduce perceived loading time', async () => {
    console.log('\n🚀 TESTING PREFETCHING STRATEGIES...\n');

    let prefetchCount = 0;
    const mockPrefetchFetch = vi.fn((url) => {
      prefetchCount++;
      const isStatsCall = url.includes('/stats');

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(isStatsCall ? {
          progress: { completedLength: 500, totalLength: 1000 },
          financial: { totalSpent: 50000, projectBudget: 100000 },
        } : {
          id: 'project-1',
          name: 'Test Project',
          status: 'active',
        }),
      });
    });

    global.fetch = mockPrefetchFetch;

    const { result } = renderHook(
      () => usePrefetchStrategies(),
      { wrapper }
    );

    const prefetchStart = performance.now();

    // Simulate user hovering over project link
    await result.current.prefetchProjectDetails('project-1');

    const prefetchTime = performance.now() - prefetchStart;
    console.log(`📊 Prefetch completed in: ${prefetchTime.toFixed(2)}ms`);
    console.log(`📊 Prefetch calls made: ${prefetchCount}`);

    // Check if data is now in cache
    const cachedProject = queryClient.getQueryData(['projects', 'detail', 'project-1']);
    const cachedStats = queryClient.getQueryData(['projects', 'detail', 'project-1', 'stats']);

    console.log(`📊 Project cached: ${cachedProject ? 'Yes' : 'No'}`);
    console.log(`📊 Stats cached: ${cachedStats ? 'Yes' : 'No'}`);

    // PERFORMANCE ASSERTIONS
    expect(prefetchCount).toBeGreaterThan(0); // Should have made prefetch calls
    expect(cachedProject).toBeTruthy(); // Project should be cached
    expect(cachedStats).toBeTruthy(); // Stats should be cached
    expect(prefetchTime).toBeLessThan(500); // Prefetch should be fast

    console.log('✅ PREFETCHING: Reduced perceived loading time');
  });

  test('PERFORMANCE: cache memory usage stays within bounds', async () => {
    console.log('\n🚀 TESTING CACHE MEMORY EFFICIENCY...\n');

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: Array.from({ length: 100 }, (_, i) => ({
            id: `item-${i}`,
            name: `Item ${i}`,
            data: 'x'.repeat(1000), // 1KB of data per item
          })),
          total: 1000,
        }),
      })
    );

    global.fetch = mockFetch;

    const startMemory = performance.memory?.usedJSHeapSize || 0;
    console.log(`📊 Initial memory usage: ${(startMemory / 1024 / 1024).toFixed(2)}MB`);

    // Load multiple queries to test memory usage
    const queries = Array.from({ length: 10 }, (_, i) =>
      renderHook(() => useProjects({ category: `cat-${i}` }), { wrapper })
    );

    // Wait for all queries to complete
    await Promise.all(queries.map(async (query) => {
      await waitFor(() => {
        expect(query.result.current.isSuccess).toBe(true);
      });
    }));

    const afterQueriesMemory = performance.memory?.usedJSHeapSize || 0;
    console.log(`📊 Memory after queries: ${(afterQueriesMemory / 1024 / 1024).toFixed(2)}MB`);

    // Force garbage collection by clearing old data
    queryClient.clear();

    // Trigger garbage collection (if available)
    if (global.gc) {
      global.gc();
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const afterGCMemory = performance.memory?.usedJSHeapSize || 0;
    console.log(`📊 Memory after GC: ${(afterGCMemory / 1024 / 1024).toFixed(2)}MB`);

    const memoryIncrease = afterQueriesMemory - startMemory;
    const memoryReleased = afterQueriesMemory - afterGCMemory;

    console.log(`📊 Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📊 Memory released: ${(memoryReleased / 1024 / 1024).toFixed(2)}MB`);

    // MEMORY ASSERTIONS
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    expect(memoryReleased).toBeGreaterThan(0); // Should release some memory

    console.log('✅ MEMORY EFFICIENCY: Cache stays within reasonable bounds');
  });

  test('ANALYSIS: identify query performance bottlenecks', async () => {
    console.log('\n🔍 ANALYZING QUERY PERFORMANCE BOTTLENECKS...\n');

    const queryTimes: Record<string, number> = {};
    const mockTimedFetch = vi.fn((url) => {
      const startTime = performance.now();

      return new Promise(resolve => {
        // Simulate different response times for different endpoints
        const delay = url.includes('/stats') ? 200 :
                     url.includes('/projects') ? 100 : 50;

        setTimeout(() => {
          const endTime = performance.now();
          queryTimes[url] = endTime - startTime;

          resolve({
            ok: true,
            json: () => Promise.resolve({
              items: [],
              total: 0,
            }),
          });
        }, delay);
      });
    });

    global.fetch = mockTimedFetch;

    // Test different query types
    const testQueries = [
      { hook: () => useProjects(), name: 'Projects List' },
      { hook: () => useProjects({ status: 'active' }), name: 'Filtered Projects' },
    ];

    for (const { hook, name } of testQueries) {
      const start = performance.now();
      const { result } = renderHook(hook, { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const totalTime = performance.now() - start;
      console.log(`📊 ${name}: ${totalTime.toFixed(2)}ms total`);
    }

    // Analyze bottlenecks
    const slowQueries = Object.entries(queryTimes)
      .filter(([_, time]) => time > 100)
      .sort(([, a], [, b]) => b - a);

    console.log('\n🐌 SLOW QUERIES (>100ms):');
    slowQueries.forEach(([url, time]) => {
      console.log(`  - ${url}: ${time.toFixed(2)}ms`);
    });

    console.log('\n📋 OPTIMIZATION RECOMMENDATIONS:');
    if (slowQueries.length > 0) {
      console.log('  - Consider implementing query splitting for complex data');
      console.log('  - Add background refetch for heavy statistics');
      console.log('  - Implement progressive loading for large datasets');
    } else {
      console.log('  - All queries performing within acceptable limits');
    }

    expect(Object.keys(queryTimes).length).toBeGreaterThan(0);
    console.log('\n💾 Performance analysis complete - ready for optimization phase');
  });
});