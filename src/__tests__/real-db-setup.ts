/**
 * REAL DATABASE TESTING SETUP
 *
 * NO MOCKS ALLOWED - только реальная PostgreSQL интеграция
 */

import { expect, beforeAll, afterAll, vi } from 'vitest';
import { pool, query } from '@/lib/db-client';

// Extend Vitest matchers with Testing Library matchers
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Database connection validation
beforeAll(async () => {
  try {
    console.log('🔄 Connecting to real database...');
    const result = await query('SELECT version(), current_database(), current_user');
    console.log('✅ Real database connected:', {
      version: result.rows[0].version.split(' ')[0],
      database: result.rows[0].current_database,
      user: result.rows[0].current_user
    });

    // Verify required tables exist
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('projects', 'users', 'work_entries', 'crews', 'materials')
    `);

    const existingTables = tablesResult.rows.map(row => row.table_name);
    const requiredTables = ['projects', 'users', 'work_entries', 'crews', 'materials'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.warn('⚠️  Missing tables:', missingTables);
    } else {
      console.log('✅ All required tables exist:', existingTables);
    }

  } catch (error) {
    console.error('❌ Real database connection failed:', error);
    throw new Error(`
      Real database connection required for testing!

      Please ensure:
      1. DATABASE_URL is set in environment
      2. PostgreSQL server is running
      3. Database contains required tables

      Current DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'missing'}

      NO MOCKS ALLOWED - only real database integration
    `);
  }
});

afterAll(async () => {
  console.log('🔄 Closing real database connections...');
  if (!pool.ended) {
    await pool.end();
    console.log('✅ Database connections closed');
  } else {
    console.log('⚠️ Database pool already closed');
  }
});

// Real database utilities for testing

export class DatabaseTestUtils {
  /**
   * Create test data in real database
   */
  static async createTestProject(data: Partial<any> = {}) {
    const projectData = {
      id: crypto.randomUUID(),
      name: `Test Project ${Date.now()}`,
      customer: 'Test Customer',
      city: 'Test City',
      total_length_m: 1000,
      base_rate_per_m: 25,
      status: 'active',
      ...data
    };

    const result = await query(`
      INSERT INTO projects (id, name, customer, city, total_length_m, base_rate_per_m, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      projectData.id,
      projectData.name,
      projectData.customer,
      projectData.city,
      projectData.total_length_m,
      projectData.base_rate_per_m,
      projectData.status
    ]);

    return result.rows[0];
  }

  /**
   * Get first existing user ID from database
   */
  static async getExistingUserId(): Promise<string> {
    const result = await query(`SELECT id FROM users LIMIT 1`);
    if (result.rows.length === 0) {
      throw new Error('No users found in database for testing');
    }
    return result.rows[0].id;
  }

  /**
   * Create test work entry in real database
   */
  static async createTestWorkEntry(projectId: string, data: Partial<any> = {}) {
    const existingUserId = await this.getExistingUserId();

    const workEntryData = {
      id: crypto.randomUUID(),
      project_id: projectId,
      user_id: existingUserId, // Use existing user instead of random UUID
      work_type: 'fiber_installation',
      duration_hours: 8.5,
      start_time: new Date().toISOString(),
      ...data
    };

    const result = await query(`
      INSERT INTO work_entries (id, project_id, user_id, work_type, duration_hours, start_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      workEntryData.id,
      workEntryData.project_id,
      workEntryData.user_id,
      workEntryData.work_type,
      workEntryData.duration_hours,
      workEntryData.start_time
    ]);

    return result.rows[0];
  }

  /**
   * Clean up test data from real database
   */
  static async cleanupTestData() {
    try {
      // Delete test data created during tests (cascade will handle work_entries)
      await query(`DELETE FROM projects WHERE name LIKE 'Test Project %' OR name LIKE 'TDD Test Project %'`);
      console.log('🧹 Test data cleaned from real database');
    } catch (error) {
      console.warn('⚠️ Error during cleanup (non-critical):', error);
    }
  }

  /**
   * Get real database performance metrics
   */
  static async getDatabaseMetrics() {
    const metricsResult = await query(`
      SELECT
        pg_stat_database.numbackends as active_connections,
        pg_stat_database.tup_returned as tuples_returned,
        pg_stat_database.tup_fetched as tuples_fetched,
        pg_size_pretty(pg_database_size(current_database())) as database_size
      FROM pg_stat_database
      WHERE datname = current_database()
    `);

    return metricsResult.rows[0];
  }

  /**
   * Analyze query execution plan
   */
  static async analyzeQuery(queryText: string, params: any[] = []) {
    const explainResult = await query(`EXPLAIN (ANALYZE, BUFFERS) ${queryText}`, params);
    const plan = explainResult.rows.map(row => row['QUERY PLAN']).join('\n');

    // Extract execution time
    const timeMatch = plan.match(/Execution Time: ([\d.]+) ms/);
    const executionTime = timeMatch ? parseFloat(timeMatch[1]) : null;

    return {
      plan,
      executionTime,
      usesIndex: plan.includes('Index Scan') || plan.includes('Index Only Scan'),
      hasSeqScan: plan.includes('Seq Scan'),
      bufferHits: plan.match(/Buffers: shared hit=(\d+)/)?.[1]
    };
  }
}

// Mock only browser APIs that don't exist in Node.js environment
// NO DATABASE MOCKS ALLOWED

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Only mock browser APIs if window exists (not in Node.js)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  });
}

// Environment setup for real database testing
process.env.NODE_ENV = 'test';

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error(`
    DATABASE_URL environment variable is required for real database testing.

    NO MOCKS ALLOWED - only real PostgreSQL integration.

    Set DATABASE_URL in your .env file:
    DATABASE_URL=postgresql://user:password@localhost:5432/cometa
  `);
}

console.log('🔧 Real database testing setup complete - NO MOCKS USED');