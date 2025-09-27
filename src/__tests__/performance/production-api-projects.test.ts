/**
 * PRODUCTION API ROUTE TDD TESTS
 *
 * FINAL TDD VERIFICATION: Тестирует production-ready API route
 * ЦЕЛЬ: Подтвердить что /api/projects-optimized работает быстрее чем baseline
 *
 * NO MOCKS - только реальная Supabase + Next.js интеграция
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseTestUtils } from '../real-db-setup';

// Test the actual API route
const OPTIMIZED_API_ROUTE = 'http://localhost:3001/api/projects-optimized';

describe('TDD: Production-Ready Optimized API Route', () => {
  let testProjectIds: string[] = [];

  beforeAll(async () => {
    console.log('🔧 Setting up test data for production API testing...');

    // Create test data for realistic performance testing
    for (let i = 0; i < 5; i++) {
      const project = await DatabaseTestUtils.createTestProject({
        name: `Production Test Project ${i + 1}`,
        customer: `Production Customer ${i + 1}`,
        city: `Production City ${i + 1}`,
        status: 'active'
      });
      testProjectIds.push(project.id);

      // Create work entries for progress calculation testing
      for (let j = 0; j < 2; j++) {
        await DatabaseTestUtils.createTestWorkEntry(project.id, {
          duration_hours: 6.0 + j,
          work_type: 'production_test'
        });
      }
    }
    console.log(`✅ Created ${testProjectIds.length} production test projects`);
  });

  afterAll(async () => {
    await DatabaseTestUtils.cleanupTestData();
    console.log('🧹 Production test data cleaned up');
  });

  test('PRODUCTION: optimized API route should be fast and reliable', async () => {
    console.log('🚀 TESTING PRODUCTION API ROUTE');

    const start = performance.now();

    const response = await fetch(OPTIMIZED_API_ROUTE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const duration = performance.now() - start;
    const responseData = await response.json();

    console.log(`📊 PRODUCTION API - Response time: ${duration}ms`);
    console.log(`📊 PRODUCTION API - Status: ${response.status}`);
    console.log(`📊 PRODUCTION API - Projects count: ${responseData.data?.length || 0}`);
    console.log(`📊 PRODUCTION API - Database time: ${responseData.metadata?.executionTime}ms`);
    console.log(`📊 PRODUCTION API - Cache status: ${responseData.metadata?.cached}`);

    // PRODUCTION REQUIREMENTS - MUST PASS
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(responseData.data).toBeInstanceOf(Array);
    expect(responseData.data.length).toBeGreaterThan(0);

    // PERFORMANCE REQUIREMENTS
    expect(duration).toBeLessThan(1000); // Total API response < 1s
    expect(responseData.metadata?.executionTime).toBeLessThan(500); // DB query < 500ms

    // VERIFY DATA STRUCTURE
    const firstProject = responseData.data[0];
    expect(firstProject).toHaveProperty('id');
    expect(firstProject).toHaveProperty('name');
    expect(firstProject).toHaveProperty('progress');
    expect(firstProject.progress).toHaveProperty('completed_hours');
    expect(firstProject.progress).toHaveProperty('progress_percentage');

    // VERIFY METADATA
    expect(responseData.metadata).toHaveProperty('count');
    expect(responseData.metadata).toHaveProperty('executionTime');
    expect(responseData.metadata).toHaveProperty('optimized', true);

    console.log('✅ PRODUCTION API ROUTE - All requirements met!');
  });

  test('BENCHMARK: compare optimized API vs N+1 baseline expectations', async () => {
    console.log('📊 BENCHMARK COMPARISON');

    // Test optimized API
    const optimizedStart = performance.now();
    const optimizedResponse = await fetch(OPTIMIZED_API_ROUTE);
    const optimizedDuration = performance.now() - optimizedStart;
    const optimizedData = await optimizedResponse.json();

    // Expected baseline metrics (from our baseline tests)
    const baselineN1Time = 250; // ms - typical N+1 problem time
    const baselineProjectQuery = 40; // ms - basic projects query

    console.log(`📊 BENCHMARK - Optimized API: ${optimizedDuration}ms`);
    console.log(`📊 BENCHMARK - Baseline N+1 expected: ${baselineN1Time}ms`);
    console.log(`📊 BENCHMARK - Performance improvement: ${(baselineN1Time / optimizedDuration).toFixed(2)}x`);

    // BENCHMARK REQUIREMENTS
    expect(optimizedDuration).toBeLessThan(baselineN1Time); // Should be faster than N+1
    expect(optimizedData.metadata.executionTime).toBeLessThan(baselineProjectQuery * 3); // DB query reasonable

    const improvementFactor = baselineN1Time / optimizedDuration;
    expect(improvementFactor).toBeGreaterThan(1.5); // At least 50% improvement

    console.log(`✅ BENCHMARK SUCCESS - ${improvementFactor.toFixed(2)}x improvement achieved!`);
  });

  test('CACHE: verify caching headers and invalidation', async () => {
    console.log('🔄 TESTING CACHE FUNCTIONALITY');

    // First request
    const firstResponse = await fetch(OPTIMIZED_API_ROUTE);
    const firstHeaders = Object.fromEntries(firstResponse.headers.entries());

    // Check cache headers
    expect(firstHeaders['cache-control']).toContain('public');
    expect(firstHeaders['x-optimized']).toBe('true');
    expect(firstHeaders['x-database-time']).toBeDefined();

    // Test cache invalidation endpoint
    const invalidateResponse = await fetch(OPTIMIZED_API_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revalidate: true })
    });

    const invalidateData = await invalidateResponse.json();

    expect(invalidateResponse.status).toBe(200);
    expect(invalidateData.success).toBe(true);
    expect(invalidateData.message).toContain('Cache invalidated');

    console.log('✅ CACHE FUNCTIONALITY - Headers and invalidation working!');
  });

  test('HEALTH: verify health check endpoint', async () => {
    console.log('🏥 TESTING HEALTH CHECK');

    const healthResponse = await fetch(`${OPTIMIZED_API_ROUTE}?health=true`, {
      method: 'OPTIONS'
    });

    const healthData = await healthResponse.json();

    console.log(`📊 HEALTH CHECK - Status: ${healthData.status}`);
    console.log(`📊 HEALTH CHECK - Response time: ${healthData.responseTime}`);

    expect(healthResponse.status).toBe(200);
    expect(healthData.status).toBe('healthy');
    expect(healthData.optimized).toBe(true);
    expect(healthData.services.supabase).toBe('healthy');

    console.log('✅ HEALTH CHECK - All systems operational!');
  });

  test('ERROR HANDLING: verify graceful error responses', async () => {
    console.log('⚠️ TESTING ERROR HANDLING');

    // Test invalid POST request
    const invalidResponse = await fetch(OPTIMIZED_API_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    });

    const errorData = await invalidResponse.json();

    expect(invalidResponse.status).toBe(400);
    expect(errorData.success).toBe(false);
    expect(errorData.message).toContain('Invalid request');

    console.log('✅ ERROR HANDLING - Proper error responses working!');
  });

  test('TDD FINAL: comprehensive production readiness verification', async () => {
    console.log('🎯 FINAL TDD VERIFICATION');

    const start = performance.now();
    const response = await fetch(OPTIMIZED_API_ROUTE);
    const duration = performance.now() - start;
    const data = await response.json();

    // ALL TDD REQUIREMENTS MUST PASS
    const requirements = {
      'API Response OK': response.ok,
      'Response Time < 500ms': duration < 500,
      'Database Query < 300ms': data.metadata.executionTime < 300,
      'Projects Array Returned': Array.isArray(data.data),
      'Projects Count > 0': data.data.length > 0,
      'Progress Data Present': data.data[0]?.progress !== undefined,
      'Optimized Flag Set': data.metadata.optimized === true,
      'Cache Headers Present': response.headers.get('cache-control') !== null,
      'Performance Headers Present': response.headers.get('x-database-time') !== null
    };

    console.log('📋 FINAL TDD REQUIREMENTS:');
    for (const [requirement, passed] of Object.entries(requirements)) {
      const status = passed ? '✅' : '❌';
      console.log(`  ${status} ${requirement}: ${passed}`);
      expect(passed).toBe(true);
    }

    console.log(`📊 FINAL METRICS:`);
    console.log(`  - Total API time: ${duration}ms`);
    console.log(`  - Database time: ${data.metadata.executionTime}ms`);
    console.log(`  - Projects returned: ${data.data.length}`);
    console.log(`  - Cache enabled: ${data.metadata.cached}`);
    console.log(`  - Optimization active: ${data.metadata.optimized}`);

    console.log('🎉 TDD SUCCESS - Production-ready API route fully verified!');
  });
});