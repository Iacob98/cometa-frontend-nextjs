/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env
config();

/**
 * VITEST CONFIG FOR REAL DATABASE TESTING
 *
 * NO MOCKS - только реальная PostgreSQL интеграция
 * Используется для performance и security тестирования
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Node environment for database connections
    setupFiles: ['./src/__tests__/real-db-setup.ts'],
    testTimeout: 60000, // 60 seconds for API integration tests
    hookTimeout: 30000,
    teardownTimeout: 30000,

    // Real database tests should run sequentially to avoid conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Sequential execution for database tests
      },
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'src/__tests__/mocks/**', // Exclude mock files
        '**/*.d.ts',
        '**/*.config.*',
        'src/components/ui/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Include only real database tests
    include: [
      'src/__tests__/performance/**/*.test.ts',
      'src/__tests__/security/**/*.test.ts',
      'src/__tests__/integration/real-db/**/*.test.ts',
    ],

    // Exclude mock-based tests
    exclude: [
      'src/__tests__/mocks/**',
      'src/__tests__/unit/**',
      'src/__tests__/**/*.mock.test.ts',
    ],

    // Environment variables validation
    env: {
      NODE_ENV: 'test',
      // Ensure DATABASE_URL is required
      DATABASE_URL: process.env.DATABASE_URL || '',
    },

    // Custom reporter for database metrics
    reporters: ['default', 'verbose'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Validate required environment
  define: {
    __REAL_DB_TESTING__: 'true',
    __NO_MOCKS_ALLOWED__: 'true',
  },
});

// Validate database URL at config time
if (!process.env.DATABASE_URL) {
  console.error(`
❌ REAL DATABASE TESTING REQUIRES DATABASE_URL

Current status:
- DATABASE_URL: ${process.env.DATABASE_URL ? '✅ configured' : '❌ missing'}

Real database testing configuration requires:
1. DATABASE_URL environment variable
2. PostgreSQL server running
3. Database with required tables

NO MOCKS ALLOWED - only real database integration.

Set in .env:
DATABASE_URL=postgresql://user:password@localhost:5432/cometa
  `);

  process.exit(1);
}

console.log(`
🔧 Real Database Testing Configuration Loaded

Environment:
- NODE_ENV: ${process.env.NODE_ENV}
- DATABASE_URL: ${process.env.DATABASE_URL ? '✅ configured' : '❌ missing'}
- Test Environment: node (for database connections)
- Pool: forks (sequential execution)
- NO MOCKS ALLOWED ✅

Ready for performance and security testing with live PostgreSQL.
`);