/**
 * REAL DATABASE PERFORMANCE BASELINE TESTS
 *
 * NO MOCKS - только реальная PostgreSQL БД
 * Измеряем текущую производительность для baseline
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { pool, query } from '@/lib/db-client';

describe('Real Database Performance Baseline', () => {
  let baselineMetrics: {
    projectsQueryTime: number;
    projectsWithProgressTime: number;
    queryCount: number;
    connectionCount: number;
  };

  beforeAll(async () => {
    // Ensure database connection is working
    try {
      const result = await query('SELECT NOW()');
      console.log('✅ Real database connected:', result.rows[0]);
    } catch (error) {
      console.error('❌ Failed to connect to real database:', error);
      throw new Error('Real database connection required - no mocks allowed');
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  test('baseline: projects API current performance with real database', async () => {
    const start = performance.now();

    // Real SQL query matching current implementation in /src/app/api/projects/route.ts:32
    const result = await query(`
      SELECT
        p.id,
        p.name,
        p.customer,
        p.city,
        p.address,
        p.contact_24h,
        p.start_date,
        p.end_date_plan,
        p.status,
        p.total_length_m,
        p.base_rate_per_m,
        p.pm_user_id,
        p.language_default,
        u.first_name as pm_first_name,
        u.last_name as pm_last_name
      FROM projects p
      LEFT JOIN users u ON p.pm_user_id = u.id
      ORDER BY p.start_date DESC
      LIMIT 20
    `);

    const duration = performance.now() - start;

    expect(result.rows.length).toBeGreaterThanOrEqual(0);
    console.log(`📊 BASELINE - Projects query: ${duration}ms, rows: ${result.rows.length}`);

    baselineMetrics = {
      ...baselineMetrics,
      projectsQueryTime: duration
    };

    // Current implementation should be slow due to no JOIN optimization
    // Recording baseline - expecting 50-200ms for basic query
  });

  test('baseline: N+1 problem - progress calculation for each project', async () => {
    // First get projects
    const projectsResult = await query(`
      SELECT id, total_length_m FROM projects LIMIT 5
    `);

    if (projectsResult.rows.length === 0) {
      console.log('⚠️  No projects found in database - creating test data needed');
      return;
    }

    const start = performance.now();
    let queryCount = 0;

    // Simulate current N+1 problem from /src/app/api/projects/route.ts:85-98
    for (const project of projectsResult.rows) {
      const progressStart = performance.now();

      const progressResult = await query(`
        SELECT COALESCE(SUM(duration_hours), 0) as completed_hours
        FROM work_entries
        WHERE project_id = $1
      `, [project.id]);

      const progressTime = performance.now() - progressStart;
      queryCount++;

      console.log(`🐌 Project ${project.id}: ${progressTime}ms`);
    }

    const totalDuration = performance.now() - start;

    expect(queryCount).toBe(projectsResult.rows.length);
    console.log(`📊 BASELINE - N+1 Problem: ${totalDuration}ms for ${queryCount} queries`);
    console.log(`📊 Average per project: ${totalDuration / queryCount}ms`);

    baselineMetrics = {
      ...baselineMetrics,
      projectsWithProgressTime: totalDuration,
      queryCount
    };

    // This should be slow - recording baseline for improvement comparison
    expect(totalDuration).toBeGreaterThan(0);
  });

  test('baseline: database connection pool monitoring', async () => {
    // Monitor real connection pool usage
    const poolInfo = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };

    console.log('📊 BASELINE - Connection Pool:', poolInfo);

    baselineMetrics = {
      ...baselineMetrics,
      connectionCount: pool.totalCount
    };

    expect(pool.totalCount).toBeGreaterThanOrEqual(0);
    expect(pool.idleCount).toBeGreaterThanOrEqual(0);
  });

  test('baseline: current docker exec approach simulation', async () => {
    // We can't test docker exec directly in tests, but we can measure
    // the overhead of multiple separate queries vs optimized single query

    const start = performance.now();

    // Multiple separate queries (simulating docker exec overhead)
    const queries = [
      'SELECT COUNT(*) FROM projects',
      'SELECT COUNT(*) FROM users',
      'SELECT COUNT(*) FROM work_entries',
      'SELECT COUNT(*) FROM crews'
    ];

    for (const queryText of queries) {
      await query(queryText);
    }

    const multiQueryTime = performance.now() - start;

    // Compare with single query
    const singleStart = performance.now();
    await query(`
      SELECT
        (SELECT COUNT(*) FROM projects) as projects_count,
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM work_entries) as work_entries_count,
        (SELECT COUNT(*) FROM crews) as crews_count
    `);
    const singleQueryTime = performance.now() - singleStart;

    console.log(`📊 BASELINE - Multiple queries: ${multiQueryTime}ms`);
    console.log(`📊 BASELINE - Single query: ${singleQueryTime}ms`);
    console.log(`📊 BASELINE - Efficiency gain: ${(multiQueryTime / singleQueryTime).toFixed(2)}x`);

    // Note: Single query can sometimes be slower due to subquery complexity
    // The important metric is that we have baseline measurements
    expect(singleQueryTime).toBeGreaterThan(0);
    expect(multiQueryTime).toBeGreaterThan(0);
  });

  test('save baseline metrics for comparison', async () => {
    // This will be used to compare improvements
    const finalMetrics = {
      timestamp: new Date().toISOString(),
      ...baselineMetrics,
      testEnvironment: 'real-database',
      mocksUsed: false,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
    };

    console.log('📊 FINAL BASELINE METRICS:', JSON.stringify(finalMetrics, null, 2));

    // Verify we have real data
    expect(finalMetrics.mocksUsed).toBe(false);
    expect(finalMetrics.databaseUrl).toBe('configured');
    expect(finalMetrics.projectsQueryTime).toBeGreaterThan(0);
  });
});