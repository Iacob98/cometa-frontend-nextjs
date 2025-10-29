/**
 * Phase 5: API Performance Tests for Soil Types
 *
 * Tests API endpoint performance under normal load conditions.
 * Establishes baseline metrics for response times and throughput.
 *
 * @see .claude/implementation-plans/PHASE5_PERFORMANCE_PLAN.md
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:3000';
const TEST_PROJECT_ID = '8cd3a97f-e911-42c3-b145-f9f5c1c6340a';

// Test credentials
const TEST_CREDENTIALS = {
  admin: { email: 'admin@cometa.de', pin_code: '1234' },
};

let authToken: string = '';

describe('Phase 5: Soil Types API Performance Tests', () => {

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CREDENTIALS.admin),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.access_token;
    }
  }, 10000);

  describe('GET /api/projects/:id/soil-types Performance', () => {

    it('should respond within 200ms for empty results', async () => {
      const startTime = performance.now();

      const response = await fetch(
        `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }
      );

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(responseTime).toBeLessThan(200); // Target: < 100ms, Warning: < 200ms
    });

    it('should handle 10 concurrent requests efficiently', async () => {
      const startTime = performance.now();

      const requests = Array.from({ length: 10 }, () =>
        fetch(`${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        })
      );

      const responses = await Promise.all(requests);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / 10;

      // All requests should succeed
      expect(responses.every(r => r.ok)).toBe(true);

      // Average response time should be reasonable
      expect(avgResponseTime).toBeLessThan(300); // Allow higher avg for concurrent

      // Total time should show parallelization benefit (< 10x single request)
      expect(totalTime).toBeLessThan(2000);
    }, 30000);

    it('should maintain performance with sequential requests', async () => {
      const responseTimes: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();

        const response = await fetch(
          `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
          {
            headers: { 'Authorization': `Bearer ${authToken}` },
          }
        );

        const endTime = performance.now();
        responseTimes.push(endTime - startTime);

        expect(response.ok).toBe(true);
      }

      // All requests should be fast
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(200);
      });

      // Calculate statistics
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);

      console.log(`GET Performance Stats (5 sequential requests):`);
      console.log(`  Average: ${avgTime.toFixed(2)}ms`);
      console.log(`  Min: ${minTime.toFixed(2)}ms`);
      console.log(`  Max: ${maxTime.toFixed(2)}ms`);
      console.log(`  Range: ${(maxTime - minTime).toFixed(2)}ms`);

      // Performance should be consistent
      expect(maxTime - minTime).toBeLessThan(100); // Variance should be low
    });
  });

  describe('POST /api/projects/:id/soil-types Performance', () => {

    it('should create soil type within 300ms', async () => {
      const testData = {
        soil_type_name: `Perf Test ${Date.now()}`,
        price_per_meter: 25.50,
        quantity_meters: 100,
        notes: 'Performance test data',
      };

      const startTime = performance.now();

      const response = await fetch(
        `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        }
      );

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(300); // Target: < 150ms, Warning: < 300ms

      // Cleanup
      const created = await response.json();
      if (created.id) {
        await fetch(
          `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types/${created.id}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` },
          }
        );
      }
    });

    it('should handle 5 concurrent creates efficiently', async () => {
      const testDataArray = Array.from({ length: 5 }, (_, i) => ({
        soil_type_name: `Concurrent Test ${Date.now()}-${i}`,
        price_per_meter: 20 + i,
        quantity_meters: 50,
      }));

      const startTime = performance.now();

      const requests = testDataArray.map(data =>
        fetch(`${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
      );

      const responses = await Promise.all(requests);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All creates should succeed
      expect(responses.every(r => r.status === 201)).toBe(true);

      // Total time should be reasonable
      expect(totalTime).toBeLessThan(1500); // 5 concurrent creates

      console.log(`POST Concurrent Performance (5 requests):`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average per request: ${(totalTime / 5).toFixed(2)}ms`);

      // Cleanup
      const created = await Promise.all(responses.map(r => r.json()));
      await Promise.all(
        created.map(item =>
          fetch(
            `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types/${item.id}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${authToken}` },
            }
          )
        )
      );
    }, 30000);
  });

  describe('DELETE /api/projects/:id/soil-types/:soilTypeId Performance', () => {

    it('should delete soil type within 200ms', async () => {
      // First create a test item
      const createResponse = await fetch(
        `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            soil_type_name: `Delete Perf Test ${Date.now()}`,
            price_per_meter: 30,
            quantity_meters: 75,
          }),
        }
      );

      const created = await createResponse.json();

      // Now test delete performance
      const startTime = performance.now();

      const response = await fetch(
        `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types/${created.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` },
        }
      );

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(responseTime).toBeLessThan(200); // Target: < 100ms, Warning: < 200ms

      console.log(`DELETE Performance: ${responseTime.toFixed(2)}ms`);
    });
  });

  describe('Full CRUD Cycle Performance', () => {

    it('should complete full CRUD cycle within 1 second', async () => {
      const testData = {
        soil_type_name: `CRUD Cycle Test ${Date.now()}`,
        price_per_meter: 28.75,
        quantity_meters: 90,
      };

      const startTime = performance.now();

      // 1. Create
      const createResponse = await fetch(
        `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        }
      );
      expect(createResponse.status).toBe(201);
      const created = await createResponse.json();

      // 2. Read (list)
      const readResponse = await fetch(
        `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }
      );
      expect(readResponse.ok).toBe(true);
      const allItems = await readResponse.json();
      expect(allItems.some((item: any) => item.id === created.id)).toBe(true);

      // 3. Delete
      const deleteResponse = await fetch(
        `${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types/${created.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` },
        }
      );
      expect(deleteResponse.ok).toBe(true);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log(`Full CRUD Cycle Performance: ${totalTime.toFixed(2)}ms`);
      expect(totalTime).toBeLessThan(1000); // Complete cycle under 1 second
    });
  });

  describe('Performance Under Load Simulation', () => {

    it('should handle 20 mixed operations efficiently', async () => {
      const operations: Promise<Response>[] = [];
      const startTime = performance.now();

      // Mix of GET (70%), POST (20%), DELETE (10%)
      for (let i = 0; i < 20; i++) {
        const rand = Math.random();

        if (rand < 0.7) {
          // GET request (70%)
          operations.push(
            fetch(`${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`, {
              headers: { 'Authorization': `Bearer ${authToken}` },
            })
          );
        } else if (rand < 0.9) {
          // POST request (20%)
          operations.push(
            fetch(`${BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                soil_type_name: `Load Test ${Date.now()}-${i}`,
                price_per_meter: 25,
                quantity_meters: 50,
              }),
            })
          );
        }
        // Note: Skipping DELETE in load test to avoid cleanup complexity
      }

      const responses = await Promise.all(operations);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Calculate success rate
      const successCount = responses.filter(r => r.ok || r.status === 201).length;
      const successRate = (successCount / operations.length) * 100;

      console.log(`Load Test Results (20 mixed operations):`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average per operation: ${(totalTime / operations.length).toFixed(2)}ms`);
      console.log(`  Success rate: ${successRate.toFixed(1)}%`);

      // Performance targets
      expect(successRate).toBeGreaterThan(95); // 95% success rate minimum
      expect(totalTime).toBeLessThan(5000); // 20 operations in under 5 seconds
    }, 60000);
  });
});
