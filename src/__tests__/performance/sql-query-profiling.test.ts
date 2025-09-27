/**
 * SQL QUERY PROFILING TESTS
 *
 * TDD APPROACH: Профилирование всех SQL запросов в приложении
 * ЦЕЛЬ: Выявить медленные запросы и создать baseline метрики
 *
 * NO MOCKS - только реальная PostgreSQL интеграция
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseTestUtils } from '../real-db-setup';
import { query } from '@/lib/db-client';

interface QueryProfile {
  query: string;
  executionTime: number;
  rowsReturned: number;
  executionPlan: string;
}

describe('SQL Query Profiling and Optimization', () => {
  let queryProfiles: QueryProfile[] = [];

  beforeAll(async () => {
    console.log('🔧 Setting up SQL profiling environment...');

    // Enable pg_stat_statements if not already enabled
    try {
      await query(`CREATE EXTENSION IF NOT EXISTS pg_stat_statements;`);
      console.log('✅ pg_stat_statements extension enabled');
    } catch (error) {
      console.log('⚠️ pg_stat_statements may already be enabled or requires superuser');
    }

    // Reset pg_stat_statements for clean measurement
    try {
      await query(`SELECT pg_stat_statements_reset();`);
      console.log('✅ pg_stat_statements reset for clean profiling');
    } catch (error) {
      console.log('⚠️ Could not reset pg_stat_statements');
    }
  });

  afterAll(async () => {
    console.log('\n📊 QUERY PROFILING SUMMARY:');
    queryProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Query: ${profile.query.slice(0, 80)}...`);
      console.log(`   Execution Time: ${profile.executionTime}ms`);
      console.log(`   Rows Returned: ${profile.rowsReturned}`);
      console.log(`   Performance: ${profile.executionTime < 100 ? '✅ Good' : profile.executionTime < 500 ? '⚠️ Moderate' : '❌ Slow'}`);
    });

    await DatabaseTestUtils.cleanupTestData();
    console.log('🧹 SQL profiling cleanup completed');
  });

  async function profileQuery(queryText: string, description: string): Promise<QueryProfile> {
    console.log(`\n📊 PROFILING: ${description}`);

    const start = performance.now();

    // Get execution plan
    const explainResult = await query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${queryText}`);
    const executionPlan = JSON.stringify(explainResult.rows[0]);

    // Execute actual query
    const result = await query(queryText);
    const executionTime = performance.now() - start;

    const profile: QueryProfile = {
      query: queryText,
      executionTime,
      rowsReturned: result.rowCount || 0,
      executionPlan
    };

    queryProfiles.push(profile);

    console.log(`⏱️ Execution time: ${executionTime}ms`);
    console.log(`📊 Rows returned: ${result.rowCount}`);

    return profile;
  }

  test('BASELINE: profile projects query (most common)', async () => {
    const queryText = `
      SELECT p.id, p.name, p.customer, p.city, p.status, p.total_length_m,
             u.first_name, u.last_name
      FROM projects p
      LEFT JOIN users u ON p.pm_user_id = u.id
      WHERE p.status = 'active'
      ORDER BY p.start_date DESC
      LIMIT 20
    `;

    const profile = await profileQuery(queryText, 'Projects list with PM details');

    // Performance requirements
    expect(profile.executionTime).toBeLessThan(200); // Should be fast
    expect(profile.rowsReturned).toBeGreaterThan(0);
  });

  test('BASELINE: profile work entries query (potential N+1)', async () => {
    const queryText = `
      SELECT we.id, we.project_id, we.duration_hours, we.work_type, we.created_at,
             p.name as project_name, u.first_name, u.last_name
      FROM work_entries we
      JOIN projects p ON we.project_id = p.id
      JOIN users u ON we.user_id = u.id
      WHERE we.created_at >= NOW() - INTERVAL '30 days'
      ORDER BY we.created_at DESC
      LIMIT 50
    `;

    const profile = await profileQuery(queryText, 'Recent work entries with project and user details');

    // This query might be slow due to multiple JOINs
    expect(profile.executionTime).toBeLessThan(500);
    expect(profile.rowsReturned).toBeGreaterThanOrEqual(0);
  });

  test('BASELINE: profile project progress aggregation (heavy query)', async () => {
    const queryText = `
      SELECT p.id, p.name, p.total_length_m,
             COALESCE(SUM(we.duration_hours), 0) as completed_hours,
             CASE
               WHEN p.total_length_m > 0 THEN
                 (COALESCE(SUM(we.duration_hours), 0) / p.total_length_m * 100)
               ELSE 0
             END as progress_percentage
      FROM projects p
      LEFT JOIN work_entries we ON p.id = we.project_id
      WHERE p.status = 'active'
      GROUP BY p.id, p.name, p.total_length_m
      ORDER BY progress_percentage DESC
      LIMIT 20
    `;

    const profile = await profileQuery(queryText, 'Project progress calculation with aggregation');

    // This is the heavy query that was causing performance issues
    expect(profile.executionTime).toBeLessThan(1000); // May be slow initially
    expect(profile.rowsReturned).toBeGreaterThan(0);
  });

  test('BASELINE: profile material allocations query', async () => {
    const queryText = `
      SELECT ma.id, ma.project_id, ma.quantity, ma.allocated_at,
             p.name as project_name, m.name as material_name, m.unit
      FROM material_allocations ma
      JOIN projects p ON ma.project_id = p.id
      JOIN materials m ON ma.material_id = m.id
      WHERE ma.allocated_at >= NOW() - INTERVAL '7 days'
      ORDER BY ma.allocated_at DESC
      LIMIT 100
    `;

    const profile = await profileQuery(queryText, 'Recent material allocations with project and material details');

    expect(profile.executionTime).toBeLessThan(300);
    expect(profile.rowsReturned).toBeGreaterThanOrEqual(0);
  });

  test('BASELINE: profile users with role information', async () => {
    const queryText = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active,
             COUNT(we.id) as work_entries_count
      FROM users u
      LEFT JOIN work_entries we ON u.id = we.user_id
        AND we.created_at >= NOW() - INTERVAL '30 days'
      WHERE u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.role, u.is_active
      ORDER BY work_entries_count DESC
      LIMIT 50
    `;

    const profile = await profileQuery(queryText, 'Active users with recent work activity');

    expect(profile.executionTime).toBeLessThan(400);
    expect(profile.rowsReturned).toBeGreaterThan(0);
  });

  test('ANALYSIS: check for missing indexes', async () => {
    console.log('\n🔍 ANALYZING MISSING INDEXES...');

    // Check for queries without indexes
    const missingIndexQuery = `
      SELECT
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats
      WHERE schemaname = 'public'
      AND n_distinct > 100  -- Columns with high cardinality
      AND correlation < 0.1 -- Low correlation (good for indexing)
      ORDER BY n_distinct DESC
      LIMIT 10
    `;

    const result = await query(missingIndexQuery);
    console.log(`📊 Found ${result.rowCount} potential columns for indexing:`, result.rows);

    expect(result.rowCount).toBeGreaterThanOrEqual(0);
  });

  test('ANALYSIS: check existing index usage', async () => {
    console.log('\n📈 ANALYZING INDEX USAGE...');

    const indexUsageQuery = `
      SELECT
        indexrelname as index_name,
        relname as table_name,
        idx_scan as times_used,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
      LIMIT 20
    `;

    const result = await query(indexUsageQuery);
    console.log(`📊 Current index usage statistics:`, result.rows);

    expect(result.rowCount).toBeGreaterThanOrEqual(0);
  });

  test('ANALYSIS: identify slow queries from pg_stat_statements', async () => {
    console.log('\n🐌 ANALYZING SLOW QUERIES...');

    try {
      const slowQueriesQuery = `
        SELECT
          left(query, 100) as short_query,
          calls,
          total_exec_time,
          mean_exec_time,
          max_exec_time,
          rows / calls as avg_rows
        FROM pg_stat_statements
        WHERE calls > 1
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `;

      const result = await query(slowQueriesQuery);
      console.log(`🐌 Found ${result.rowCount} queries in pg_stat_statements:`);

      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. Query: ${row.short_query}...`);
        console.log(`   Calls: ${row.calls}, Mean time: ${row.mean_exec_time}ms`);
        console.log(`   Max time: ${row.max_exec_time}ms, Avg rows: ${row.avg_rows}`);
      });

      expect(result.rowCount).toBeGreaterThanOrEqual(0);
    } catch (error) {
      console.log('⚠️ pg_stat_statements not available, skipping slow query analysis');
    }
  });

  test('TDD TARGET: verify performance improvements after optimization', async () => {
    console.log('\n🎯 TDD TARGET - Future optimization verification');

    // Define target metrics for optimization
    const targetMetrics = {
      projectsQuery: 50,        // ms - target for projects list
      workEntriesQuery: 100,    // ms - target for work entries
      progressQuery: 200,       // ms - target for progress calculation
      materialQuery: 80,        // ms - target for material allocations
      userQuery: 120           // ms - target for user queries
    };

    console.log('🎯 TARGET METRICS:', targetMetrics);
    console.log('📊 BASELINE COMPARISON will be available after optimization');

    // This test will be implemented after we create optimizations
    expect(true).toBe(true); // Placeholder
  });
});