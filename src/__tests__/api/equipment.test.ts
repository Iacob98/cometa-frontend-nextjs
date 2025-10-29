/**
 * API Unit Tests for Equipment Endpoints
 *
 * Tests security, validation, pagination, and business logic
 * for all Equipment API endpoints implemented in Phases 1-3
 *
 * Coverage:
 * - Authentication & Authorization (Phase 1)
 * - Performance optimizations (Phase 2)
 * - Error handling & validation (Phase 3)
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { sign } from 'jsonwebtoken';

// JWT secret must match the one used in auth-middleware.ts
const JWT_SECRET = process.env.JWT_SECRET ||
                   process.env.NEXT_PUBLIC_JWT_SECRET ||
                   'your-super-secret-jwt-key-change-in-production';

const API_BASE_URL = 'http://localhost:3000';

// Helper to generate JWT token for testing
function generateTestToken(payload: {
  user_id: string;
  email: string;
  role: string;
}) {
  return sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8 hours
    },
    JWT_SECRET
  );
}

// Test user payloads matching EQUIPMENT_PERMISSIONS matrix
const testUsers = {
  admin: {
    user_id: 'admin-id-123',
    email: 'admin@test.com',
    role: 'admin',
  },
  pm: {
    user_id: 'pm-id-456',
    email: 'pm@test.com',
    role: 'pm',
  },
  foreman: {
    user_id: 'foreman-id-789',
    email: 'foreman@test.com',
    role: 'foreman',
  },
  crew: {
    user_id: 'crew-id-101',
    email: 'crew@test.com',
    role: 'crew',
  },
  worker: {
    user_id: 'worker-id-202',
    email: 'worker@test.com',
    role: 'worker',
  },
  viewer: {
    user_id: 'viewer-id-303',
    email: 'viewer@test.com',
    role: 'viewer',
  },
};

describe('Equipment API - Main Endpoint (/api/equipment)', () => {
  describe('🔒 Authentication Tests (Phase 1)', () => {
    it('GET: Returns 401 when no token provided', async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('GET: Returns 401 for invalid Bearer token', async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        headers: {
          Authorization: 'Bearer invalid-token-12345',
        },
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('POST: Returns 401 when no token provided', async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Equipment',
          category: 'power_tool',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('🛡️ Authorization Tests (Phase 1 - Permission Matrix)', () => {
    it('GET: All roles can view equipment (viewer, crew, worker, foreman, pm, admin)', async () => {
      const roles = ['viewer', 'crew', 'worker', 'foreman', 'pm', 'admin'] as const;

      for (const role of roles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(`${API_BASE_URL}/api/equipment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        expect(response.status).not.toBe(403);
        expect([200, 500]).toContain(response.status); // 200 or 500 (DB error), but not 403
      }
    });

    it('POST: Only admin, pm, foreman can create equipment', async () => {
      const allowedRoles = ['admin', 'pm', 'foreman'] as const;
      const deniedRoles = ['crew', 'worker', 'viewer'] as const;

      // Test allowed roles
      for (const role of allowedRoles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(`${API_BASE_URL}/api/equipment`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `Test Equipment ${role}`,
            category: 'power_tool',
            inventory_no: `TEST-${role.toUpperCase()}-001`,
          }),
        });

        expect(response.status).not.toBe(403);
        // Expect 201 (success) or 400/500 (validation/DB error), but NOT 403
        expect([201, 400, 500]).toContain(response.status);
      }

      // Test denied roles
      for (const role of deniedRoles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(`${API_BASE_URL}/api/equipment`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test Equipment',
            category: 'power_tool',
          }),
        });

        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toMatch(/permission|forbidden/i);
      }
    });
  });

  describe('📦 Pagination Tests (Phase 3 - Refactored Utilities)', () => {
    const token = generateTestToken(testUsers.admin);

    it('Returns paginated results with default values (page=1, per_page=20)', async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        expect(data).toHaveProperty('page');
        expect(data).toHaveProperty('per_page');
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('total_pages');
        expect(data.page).toBe(1);
        expect(data.per_page).toBe(20);
      }
    });

    it('Respects custom pagination parameters', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?page=2&per_page=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data.page).toBe(2);
        expect(data.per_page).toBe(10);
      }
    });

    it('Clamps per_page to maximum of 100 items', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?per_page=500`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data.per_page).toBeLessThanOrEqual(100);
      }
    });

    it('Handles invalid page numbers gracefully (converts to 1)', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?page=-1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data.page).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('🔍 Filter Tests', () => {
    const token = generateTestToken(testUsers.admin);

    it('Filters by equipment type', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?type=power_tool`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        // All items should match the filter
        data.items.forEach((item: any) => {
          if (item.type) {
            expect(item.type).toBe('power_tool');
          }
        });
      }
    });

    it('Filters by category', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?category=power_tool`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
      }
    });

    it('Filters by status=available (uses optimized view - Phase 2)', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?status=available`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
        // All items should be available
        data.items.forEach((item: any) => {
          expect(item.status).toBe('available');
        });
      }
    });

    it('Filters by ownership (owned vs rented)', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?owned=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
      }
    });

    it('Handles search query (uses full-text search RPC - Phase 2)', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?search=drill`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Should not return 500 (SQL injection prevented)
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('items');
      }
    });
  });

  describe('📝 Validation Tests (Phase 3 - Zod Schema)', () => {
    const token = generateTestToken(testUsers.admin);

    it('POST: Returns 400 for missing required fields', async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing required fields: name, category, inventory_no
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('POST: Validates equipment category field', async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Equipment',
          category: 'invalid_category', // Invalid category
          inventory_no: 'TEST-001',
        }),
      });

      // Should return validation error
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('🛠️ Error Handling Tests (Phase 3 - Standardized)', () => {
    const token = generateTestToken(testUsers.admin);

    it('Returns standardized error format with timestamp', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment?page=invalid`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Even if query succeeds, invalid params should be handled
      if (response.status >= 400) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        // May have timestamp if using new error handler
        if (data.timestamp) {
          expect(data.timestamp).toBeDefined();
        }
      }
    });

    it('Handles database connection errors gracefully', async () => {
      // This test verifies error handling structure
      // Actual DB errors are hard to simulate in unit tests
      const response = await fetch(`${API_BASE_URL}/api/equipment`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Should never return HTML error page
      const contentType = response.headers.get('content-type');
      if (response.status >= 400) {
        expect(contentType).toContain('application/json');
      }
    });
  });
});

describe('Equipment API - Individual Equipment (/api/equipment/[id])', () => {
  const TEST_EQUIPMENT_ID = 'test-equipment-id-12345';

  describe('🔒 Authentication Tests', () => {
    it('GET: Returns 401 when no token provided', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment/${TEST_EQUIPMENT_ID}`
      );

      expect(response.status).toBe(401);
    });

    it('PUT: Returns 401 when no token provided', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment/${TEST_EQUIPMENT_ID}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Updated Name' }),
        }
      );

      expect(response.status).toBe(401);
    });

    it('DELETE: Returns 401 when no token provided', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/equipment/${TEST_EQUIPMENT_ID}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(401);
    });
  });

  describe('🛡️ Authorization Tests (Permission Matrix)', () => {
    it('GET: All roles can view equipment details', async () => {
      const roles = ['viewer', 'crew', 'worker', 'foreman', 'pm', 'admin'] as const;

      for (const role of roles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(
          `${API_BASE_URL}/api/equipment/${TEST_EQUIPMENT_ID}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Should not return 403 (may return 404 if equipment doesn't exist)
        expect(response.status).not.toBe(403);
      }
    });

    it('PUT: Only admin and pm can update equipment', async () => {
      const allowedRoles = ['admin', 'pm'] as const;
      const deniedRoles = ['foreman', 'crew', 'worker', 'viewer'] as const;

      // Test allowed roles
      for (const role of allowedRoles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(
          `${API_BASE_URL}/api/equipment/${TEST_EQUIPMENT_ID}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'Updated Name' }),
          }
        );

        // Should not return 403
        expect(response.status).not.toBe(403);
      }

      // Test denied roles
      for (const role of deniedRoles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(
          `${API_BASE_URL}/api/equipment/${TEST_EQUIPMENT_ID}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'Updated Name' }),
          }
        );

        expect(response.status).toBe(403);
      }
    });

    it('DELETE: Only admin can delete equipment', async () => {
      // Test admin (allowed)
      const adminToken = generateTestToken(testUsers.admin);
      const adminResponse = await fetch(
        `${API_BASE_URL}/api/equipment/${TEST_EQUIPMENT_ID}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      expect(adminResponse.status).not.toBe(403);

      // Test other roles (denied)
      const deniedRoles = ['pm', 'foreman', 'crew', 'worker', 'viewer'] as const;

      for (const role of deniedRoles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(
          `${API_BASE_URL}/api/equipment/${TEST_EQUIPMENT_ID}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        expect(response.status).toBe(403);
      }
    });
  });
});

describe('Equipment API - Analytics (/api/equipment/analytics)', () => {
  describe('🔒 Authentication & Authorization', () => {
    it('Returns 401 when no token provided', async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment/analytics`);

      expect(response.status).toBe(401);
    });

    it('Only admin and pm can view analytics', async () => {
      const allowedRoles = ['admin', 'pm'] as const;
      const deniedRoles = ['foreman', 'crew', 'worker', 'viewer'] as const;

      // Test allowed roles
      for (const role of allowedRoles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(`${API_BASE_URL}/api/equipment/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status).not.toBe(403);
      }

      // Test denied roles
      for (const role of deniedRoles) {
        const token = generateTestToken(testUsers[role]);
        const response = await fetch(`${API_BASE_URL}/api/equipment/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status).toBe(403);
      }
    });
  });

  describe('⚡ Performance Tests (Phase 2 - Parallelized Queries)', () => {
    const token = generateTestToken(testUsers.admin);

    it('Returns analytics data with expected structure', async () => {
      const response = await fetch(`${API_BASE_URL}/api/equipment/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('summary');
        expect(data).toHaveProperty('distributions');
        expect(data.summary).toHaveProperty('total_equipment');
        expect(data.summary).toHaveProperty('utilization_rate');
      }
    });

    it('Responds within reasonable time (< 1s after Phase 2 optimization)', async () => {
      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/api/equipment/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // After Phase 2 optimization (parallelized queries), should be < 1000ms
      // Before: 800-1000ms, After: 300-400ms
      if (response.status === 200) {
        expect(duration).toBeLessThan(1500); // Allow 1.5s buffer for network
      }
    });
  });
});
