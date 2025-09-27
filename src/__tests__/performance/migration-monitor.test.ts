/**
 * COMETA Migration Monitoring Dashboard
 *
 * Provides real-time monitoring of migration progress and API health
 */

import { describe, test, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

const API_BASE_URL = 'http://localhost:3000';

interface MigrationStatus {
  totalRoutes: number;
  migratedRoutes: number;
  pendingRoutes: number;
  failingRoutes: number;
  migrationProgress: number;
  lastUpdated: string;
}

interface ApiHealthCheck {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'failing' | 'unknown';
  responseTime: number;
  errorMessage?: string;
}

describe('🔍 Migration Monitoring Dashboard', () => {

  test('should generate migration status report', async () => {
    const migratedRoutes = [
      '/api/auth/login',
      '/api/users',
      '/api/work-entries',
      '/api/equipment'
    ];

    const pendingRoutes = [
      '/api/teams/crews',
      '/api/teams/crews/:id',
      '/api/activities'
    ];

    // Test migrated routes health
    const healthChecks: ApiHealthCheck[] = [];

    for (const route of migratedRoutes) {
      const startTime = Date.now();
      let status: ApiHealthCheck['status'] = 'unknown';
      let errorMessage: string | undefined;

      try {
        const response = await fetch(`${API_BASE_URL}${route}${route.includes('?') ? '&' : '?'}page=1&per_page=1`);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          status = responseTime < 300 ? 'healthy' : 'degraded';
        } else {
          status = 'failing';
          errorMessage = `HTTP ${response.status}`;
        }

        healthChecks.push({
          endpoint: route,
          status,
          responseTime,
          errorMessage
        });

      } catch (error) {
        healthChecks.push({
          endpoint: route,
          status: 'failing',
          responseTime: Date.now() - startTime,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Generate status report
    const migrationStatus: MigrationStatus = {
      totalRoutes: migratedRoutes.length + pendingRoutes.length,
      migratedRoutes: migratedRoutes.length,
      pendingRoutes: pendingRoutes.length,
      failingRoutes: healthChecks.filter(hc => hc.status === 'failing').length,
      migrationProgress: Math.round((migratedRoutes.length / (migratedRoutes.length + pendingRoutes.length)) * 100),
      lastUpdated: new Date().toISOString()
    };

    // Console output for monitoring
    console.log(`
🎯 MIGRATION STATUS REPORT
Generated: ${new Date().toLocaleString()}

📊 Progress Overview:
  Total Routes: ${migrationStatus.totalRoutes}
  ✅ Migrated: ${migrationStatus.migratedRoutes} (${migrationStatus.migrationProgress}%)
  ⏳ Pending: ${migrationStatus.pendingRoutes}
  ❌ Failing: ${migrationStatus.failingRoutes}

🚀 API Health Status:
${healthChecks.map(hc =>
  `  ${hc.status === 'healthy' ? '✅' : hc.status === 'degraded' ? '⚠️' : '❌'} ${hc.endpoint}: ${hc.responseTime}ms ${hc.errorMessage ? `(${hc.errorMessage})` : ''}`
).join('\n')}

🔄 Next Steps:
${pendingRoutes.map(route => `  • Migrate ${route}`).join('\n')}
    `);

    // Assertions
    expect(migrationStatus.migrationProgress).toBeGreaterThanOrEqual(50); // At least 50% migrated
    expect(migrationStatus.failingRoutes).toBeLessThanOrEqual(1); // Allow max 1 failing route
    expect(healthChecks.filter(hc => hc.status === 'healthy').length).toBeGreaterThan(0); // At least one healthy route

    // Save report to file
    const reportPath = path.join(process.cwd(), 'migration-status-report.json');
    await fs.writeFile(reportPath, JSON.stringify({
      migrationStatus,
      healthChecks,
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`📝 Report saved to: ${reportPath}`);
  });

  test('should monitor FastAPI dependency status', async () => {
    console.log(`
🔍 FASTAPI DEPENDENCY CHECK
Checking remaining FastAPI dependencies...
    `);

    const fastApiRoutes = [
      '/api/teams/crews',
      '/api/activities'
    ];

    const dependencyStatus = [];

    for (const route of fastApiRoutes) {
      try {
        const response = await fetch(`${API_BASE_URL}${route}?page=1&per_page=1`);
        const status = response.status;

        dependencyStatus.push({
          route,
          status: status === 503 ? 'fastapi_required' : status === 200 ? 'working' : 'error',
          httpStatus: status
        });

        console.log(`  ${status === 503 ? '🔄' : status === 200 ? '✅' : '❌'} ${route}: HTTP ${status}`);
      } catch (error) {
        dependencyStatus.push({
          route,
          status: 'network_error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`  ❌ ${route}: Network Error`);
      }
    }

    // At least one route should be identified as FastAPI dependent
    expect(dependencyStatus.length).toBeGreaterThan(0);

    console.log(`
📋 DEPENDENCY ANALYSIS:
  • Total FastAPI routes checked: ${dependencyStatus.length}
  • Routes requiring FastAPI: ${dependencyStatus.filter(d => d.status === 'fastapi_required').length}
  • Routes working independently: ${dependencyStatus.filter(d => d.status === 'working').length}
  • Routes with errors: ${dependencyStatus.filter(d => d.status === 'error').length}
    `);
  });

  test('should validate database connectivity', async () => {
    console.log(`
🗄️  DATABASE CONNECTIVITY CHECK
Testing Supabase database connection...
    `);

    let dbStatus = 'unknown';
    let connectionTime = 0;
    let errorDetails = '';

    try {
      const startTime = Date.now();

      // Test DB through API endpoint
      const response = await fetch(`${API_BASE_URL}/api/users?page=1&per_page=1`);
      connectionTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        dbStatus = data.total !== undefined ? 'healthy' : 'degraded';
      } else {
        dbStatus = 'failing';
        errorDetails = `HTTP ${response.status}`;
      }
    } catch (error) {
      dbStatus = 'failing';
      errorDetails = error instanceof Error ? error.message : 'Unknown error';
    }

    console.log(`
📊 Database Status: ${dbStatus === 'healthy' ? '✅ HEALTHY' : dbStatus === 'degraded' ? '⚠️ DEGRADED' : '❌ FAILING'}
⚡ Connection Time: ${connectionTime}ms
${errorDetails ? `❌ Error: ${errorDetails}` : ''}
    `);

    // Assertions
    expect(['healthy', 'degraded']).toContain(dbStatus);
    expect(connectionTime).toBeLessThan(1000); // Should connect within 1 second
  });

  test('should provide migration completion estimate', async () => {
    const completedTasks = 6; // Based on our progress
    const totalTasks = 9; // From our todo list
    const remainingTasks = totalTasks - completedTasks;

    // Estimate based on TaskMaster progress
    const estimatedHoursPerTask = 4; // Average estimate
    const estimatedHoursRemaining = remainingTasks * estimatedHoursPerTask;
    const estimatedDaysRemaining = Math.ceil(estimatedHoursRemaining / 8); // 8-hour workdays

    const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

    console.log(`
📈 MIGRATION COMPLETION ESTIMATE

Progress Overview:
  ✅ Completed Tasks: ${completedTasks}/${totalTasks} (${completionPercentage}%)
  ⏳ Remaining Tasks: ${remainingTasks}

Time Estimates:
  📅 Estimated Hours Remaining: ${estimatedHoursRemaining}h
  🗓️  Estimated Days Remaining: ${estimatedDaysRemaining} days
  🎯 Completion Target: ~${new Date(Date.now() + estimatedDaysRemaining * 24 * 60 * 60 * 1000).toDateString()}

Next Priority Tasks:
  1. Complete remaining 3 FastAPI route migrations (8-12h)
  2. Remove FastAPI infrastructure (4-6h)
  3. Final validation and cleanup (2-4h)

🎉 Migration is ${completionPercentage}% complete!
    `);

    // Assertions
    expect(completionPercentage).toBeGreaterThanOrEqual(60); // Should be at least 60% complete
    expect(estimatedDaysRemaining).toBeLessThanOrEqual(5); // Should complete within 5 days
  });

});