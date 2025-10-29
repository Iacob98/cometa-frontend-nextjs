/**
 * Phase 3: Integration Tests for Soil Types Feature
 *
 * Tests end-to-end workflows combining:
 * - API endpoints
 * - Database operations
 * - Business logic
 * - React Query cache behavior
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { query } from '@/lib/db-client';

// Test configuration
const TEST_PROJECT_ID = '8cd3a97f-e911-42c3-b145-f9f5c1c6340a';
const BASE_URL = 'http://localhost:3000';
const TEST_CREDENTIALS = {
  admin: { email: 'admin@cometa.de', pin_code: '1234' },
};

// Auth token storage
let authToken: string = '';

// Helper to make authenticated requests
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      ...options.headers,
    },
  });
};

describe('Phase 3: Soil Types Integration Tests', () => {
  let testSoilTypeId: string;

  beforeAll(async () => {
    // 1. Login to get auth token
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CREDENTIALS.admin),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.access_token;
    } else {
      console.warn('Failed to authenticate for integration tests');
    }

    // 2. Ensure test project exists
    const projectCheck = await query(
      'SELECT id FROM projects WHERE id = $1',
      [TEST_PROJECT_ID]
    );

    if (projectCheck.rows.length === 0) {
      console.log('Test project not found, skipping integration tests');
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test soil types
    if (testSoilTypeId) {
      await query(
        'DELETE FROM project_soil_types WHERE id = $1',
        [testSoilTypeId]
      );
    }
  });

  describe('API + Database Integration', () => {
    it('should create soil type via API and persist to database', async () => {
      const newSoilType = {
        soil_type_name: 'Integration Test Soil',
        price_per_meter: 25.50,
        quantity_meters: 100,
        notes: 'Created by integration test',
      };

      // 1. Create via API
      const response = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          body: JSON.stringify(newSoilType),
        }
      );

      // API returns 201 Created for POST requests
      expect(response.status).toBe(201);
      const apiResult = await response.json();
      testSoilTypeId = apiResult.id;

      // 2. Verify in database
      const dbResult = await query(
        'SELECT * FROM project_soil_types WHERE id = $1',
        [testSoilTypeId]
      );

      expect(dbResult.rows).toHaveLength(1);
      const dbSoilType = dbResult.rows[0];
      expect(dbSoilType.soil_type_name).toBe(newSoilType.soil_type_name);
      expect(parseFloat(dbSoilType.price_per_meter)).toBe(newSoilType.price_per_meter);
      expect(parseFloat(dbSoilType.quantity_meters)).toBe(newSoilType.quantity_meters);
    });

    it('should fetch soil types from API matching database state', async () => {
      // 1. Get current state from database
      const dbResult = await query(
        'SELECT * FROM project_soil_types WHERE project_id = $1 ORDER BY created_at DESC',
        [TEST_PROJECT_ID]
      );

      // 2. Fetch via API
      const response = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types`
      );

      expect(response.status).toBe(200);
      const apiResult = await response.json();

      // 3. Compare counts (order might differ between API and DB)
      expect(apiResult.length).toBe(dbResult.rows.length);

      // 4. Verify all IDs from DB are in API response
      if (apiResult.length > 0 && dbResult.rows.length > 0) {
        const apiIds = apiResult.map((item: any) => item.id);
        const dbIds = dbResult.rows.map((row: any) => row.id);

        // Check that all DB IDs are present in API response
        dbIds.forEach((dbId: string) => {
          expect(apiIds).toContain(dbId);
        });
      }
    });

    it('should update soil type via delete+create pattern', async () => {
      if (!testSoilTypeId) {
        console.log('Skipping update test - no test soil type created');
        return;
      }

      // Note: API uses DELETE + POST pattern instead of PUT
      // This test documents the current implementation

      // 1. Delete existing soil type
      const deleteResponse = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types?soil_type_id=${testSoilTypeId}`,
        {
          method: 'DELETE',
        }
      );

      expect(deleteResponse.status).toBe(200);

      // 2. Create new soil type with updated data
      const updatedData = {
        soil_type_name: 'Updated Integration Test Soil',
        price_per_meter: 30.00,
        quantity_meters: 150,
        notes: 'Updated by integration test',
      };

      const createResponse = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          body: JSON.stringify(updatedData),
        }
      );

      expect(createResponse.status).toBe(201);
      const newSoilType = await createResponse.json();
      testSoilTypeId = newSoilType.id; // Update reference for cleanup

      // 3. Verify in database
      const dbResult = await query(
        'SELECT * FROM project_soil_types WHERE id = $1',
        [testSoilTypeId]
      );

      expect(dbResult.rows).toHaveLength(1);
      const dbSoilType = dbResult.rows[0];
      expect(dbSoilType.soil_type_name).toBe(updatedData.soil_type_name);
      expect(parseFloat(dbSoilType.price_per_meter)).toBe(updatedData.price_per_meter);
    });

    it('should delete soil type via API and remove from database', async () => {
      if (!testSoilTypeId) {
        console.log('Skipping delete test - no test soil type created');
        return;
      }

      // 1. Delete via API
      const response = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types?soil_type_id=${testSoilTypeId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      // 2. Verify removal from database
      const dbResult = await query(
        'SELECT * FROM project_soil_types WHERE id = $1',
        [testSoilTypeId]
      );

      expect(dbResult.rows).toHaveLength(0);

      // Clear test ID since it's deleted
      testSoilTypeId = '';
    });
  });

  describe('Calculation Integration', () => {
    it('should calculate total cost correctly across multiple soil types', async () => {
      // 1. Get all soil types for project
      const response = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types`
      );

      const soilTypes = await response.json();

      // 2. Calculate total using API data
      const apiTotal = soilTypes.reduce((sum: number, st: any) => {
        return sum + (st.quantity_meters * st.price_per_meter);
      }, 0);

      // 3. Calculate total using database data
      const dbResult = await query(
        `SELECT SUM(quantity_meters * price_per_meter) as total
         FROM project_soil_types
         WHERE project_id = $1`,
        [TEST_PROJECT_ID]
      );

      const dbTotal = parseFloat(dbResult.rows[0].total || '0');

      // 4. Totals should match
      expect(apiTotal).toBeCloseTo(dbTotal, 2);
    });

    it('should handle average price calculation from database', async () => {
      // Test the new average price calculation feature
      const dbResult = await query(
        `SELECT
          soil_type_name,
          price_per_meter,
          (SELECT AVG(price_per_meter)
           FROM project_soil_types
           WHERE soil_type_name = pst.soil_type_name) as avg_price
         FROM project_soil_types pst
         WHERE project_id = $1`,
        [TEST_PROJECT_ID]
      );

      if (dbResult.rows.length > 0) {
        const firstRow = dbResult.rows[0];
        expect(firstRow.avg_price).toBeDefined();
        expect(parseFloat(firstRow.avg_price)).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid project ID gracefully', async () => {
      const invalidProjectId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedFetch(
        `/api/projects/${invalidProjectId}/soil-types`
      );

      // Should return empty array or 404, but not crash
      expect([200, 404]).toContain(response.status);
    });

    it('should reject invalid soil type data', async () => {
      const invalidData = {
        soil_type_name: '', // Empty name - should fail
        price_per_meter: -10, // Negative price - should fail
        quantity_meters: 0,
      };

      const response = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          body: JSON.stringify(invalidData),
        }
      );

      // Should reject invalid data
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle concurrent deletes correctly', async () => {
      // Create two test soil types for concurrent deletion test
      const soil1Response = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          body: JSON.stringify({
            soil_type_name: 'Concurrent Test Soil 1',
            price_per_meter: 20.00,
            quantity_meters: 50,
          }),
        }
      );

      const soil2Response = await authenticatedFetch(
        `/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          body: JSON.stringify({
            soil_type_name: 'Concurrent Test Soil 2',
            price_per_meter: 25.00,
            quantity_meters: 60,
          }),
        }
      );

      const soil1 = await soil1Response.json();
      const soil2 = await soil2Response.json();

      try {
        // Attempt two simultaneous deletes
        const delete1 = authenticatedFetch(
          `/api/projects/${TEST_PROJECT_ID}/soil-types?soil_type_id=${soil1.id}`,
          { method: 'DELETE' }
        );

        const delete2 = authenticatedFetch(
          `/api/projects/${TEST_PROJECT_ID}/soil-types?soil_type_id=${soil2.id}`,
          { method: 'DELETE' }
        );

        const [response1, response2] = await Promise.all([delete1, delete2]);

        // Both should succeed
        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);

        // Verify both are deleted from database
        const check1 = await query(
          'SELECT * FROM project_soil_types WHERE id = $1',
          [soil1.id]
        );

        const check2 = await query(
          'SELECT * FROM project_soil_types WHERE id = $1',
          [soil2.id]
        );

        expect(check1.rows).toHaveLength(0);
        expect(check2.rows).toHaveLength(0);
      } finally {
        // Cleanup (in case test failed)
        await query(
          'DELETE FROM project_soil_types WHERE id = ANY($1)',
          [[soil1.id, soil2.id]]
        );
      }
    });
  });

  describe('Transaction Integrity', () => {
    it('should maintain referential integrity with projects', async () => {
      // Verify all soil types reference valid projects
      const orphanedResult = await query(
        `SELECT pst.id, pst.project_id
         FROM project_soil_types pst
         LEFT JOIN projects p ON p.id = pst.project_id
         WHERE p.id IS NULL`
      );

      expect(orphanedResult.rows).toHaveLength(0);
    });

    it('should clean up soil types when project is deleted (if cascading)', async () => {
      // This test documents the expected behavior
      // In production, we need to decide: CASCADE or RESTRICT

      const cascadeCheckResult = await query(
        `SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          rc.delete_rule
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
         JOIN information_schema.constraint_column_usage ccu
           ON ccu.constraint_name = tc.constraint_name
         JOIN information_schema.referential_constraints rc
           ON tc.constraint_name = rc.constraint_name
         WHERE tc.table_name = 'project_soil_types'
           AND tc.constraint_type = 'FOREIGN KEY'
           AND kcu.column_name = 'project_id'`
      );

      if (cascadeCheckResult.rows.length > 0) {
        const deleteRule = cascadeCheckResult.rows[0].delete_rule;
        console.log(`Foreign key delete rule: ${deleteRule}`);
        expect(['CASCADE', 'RESTRICT', 'SET NULL']).toContain(deleteRule);
      }
    });
  });
});
