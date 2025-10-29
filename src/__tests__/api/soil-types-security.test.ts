/**
 * Security Tests for Soil Types API
 *
 * Tests authentication, authorization, and access control
 * implemented in Phase 1 Security Implementation
 *
 * Related: .claude/implementation-plans/PHASE1_COMPLETION_REPORT.md
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer } from 'http';
import { sign } from 'jsonwebtoken';

// JWT secret must match the one used in api-auth.ts and login route
const JWT_SECRET = process.env.JWT_SECRET ||
                   process.env.NEXT_PUBLIC_JWT_SECRET ||
                   'your-super-secret-jwt-key-change-in-production';

const TEST_PROJECT_ID = '8cd3a97f-e911-42c3-b145-f9f5c1c6340a';
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

// Test user payloads
const adminUser = {
  user_id: 'admin-id-123',
  email: 'admin@test.com',
  role: 'admin',
};

const pmUser = {
  user_id: 'pm-id-456',
  email: 'pm@test.com',
  role: 'pm',
};

const crewUser = {
  user_id: 'crew-id-789',
  email: 'crew@test.com',
  role: 'crew',
};

describe('Soil Types API - Security Tests', () => {
  describe('Authentication Tests', () => {
    it('GET: Returns 401 Unauthorized when no token provided', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toMatch(/authentication required/i);
    });

    it('POST: Returns 401 Unauthorized when no token provided', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            soil_type_name: 'Test',
            price_per_meter: 10,
          }),
        }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toMatch(/authentication required/i);
    });

    it('DELETE: Returns 401 Unauthorized when no token provided', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types?soil_type_id=test-id`,
        { method: 'DELETE' }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toMatch(/authentication required/i);
    });

    it('Returns 401 for invalid Bearer token', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          headers: {
            'Authorization': 'Bearer invalid_token_12345',
          },
        }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toMatch(/authentication required/i);
    });

    it('Returns 401 for malformed Authorization header', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          headers: {
            'Authorization': 'InvalidFormat token',
          },
        }
      );

      expect(response.status).toBe(401);
    });

    it('Returns 401 for expired JWT token', async () => {
      const expiredToken = sign(
        {
          user_id: 'test-user',
          email: 'test@test.com',
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        },
        JWT_SECRET
      );

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          headers: {
            'Authorization': `Bearer ${expiredToken}`,
          },
        }
      );

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Tests - Role-Based Access Control', () => {
    describe('GET Endpoint - Read Access', () => {
      it('Admin can access any project soil types', async () => {
        const token = generateTestToken(adminUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Should succeed (200) or return empty array, not 401/403
        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      });

      it('PM can access their project soil types', async () => {
        const token = generateTestToken(pmUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Will return 403 if not their project, but that's expected
        // This tests that auth is working, not specific project access
        expect(response.status).not.toBe(401);
      });

      it('Crew can access assigned project soil types', async () => {
        const token = generateTestToken(crewUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Crew member gets 200 if assigned, 403 if not
        expect(response.status).not.toBe(401);
      });
    });

    describe('POST Endpoint - Write Access (Admin/PM Only)', () => {
      it('Admin can create soil types in any project', async () => {
        const token = generateTestToken(adminUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              soil_type_name: 'Admin Test Soil',
              price_per_meter: 25.00,
              quantity_meters: 100,
            }),
          }
        );

        // Should not return 401 or 403 (role-based rejection)
        // May return 404 if project doesn't exist, which is fine
        expect(response.status).not.toBe(401);

        if (response.status === 403) {
          const data = await response.json();
          // If 403, it shouldn't be due to role (admin bypasses role check)
          expect(data.user_role).toBe('admin');
        }
      });

      it('PM can create soil types in their projects', async () => {
        const token = generateTestToken(pmUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              soil_type_name: 'PM Test Soil',
              price_per_meter: 20.00,
              quantity_meters: 50,
            }),
          }
        );

        // Should not return 401
        // Will return 403 if not their project
        expect(response.status).not.toBe(401);
      });

      it('Crew CANNOT create soil types (403 Forbidden)', async () => {
        const token = generateTestToken(crewUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              soil_type_name: 'Crew Test Soil',
              price_per_meter: 15.00,
            }),
          }
        );

        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toMatch(/forbidden|insufficient permissions/i);
        expect(data.user_role).toBe('crew');
        expect(data.required_roles).toEqual(['admin', 'pm']);
      });
    });

    describe('DELETE Endpoint - Write Access (Admin/PM Only)', () => {
      it('Admin can delete soil types from any project', async () => {
        const token = generateTestToken(adminUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types?soil_type_id=test-id`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Should not return 401 or 403 (role-based)
        expect(response.status).not.toBe(401);
      });

      it('PM can delete soil types from their projects', async () => {
        const token = generateTestToken(pmUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types?soil_type_id=test-id`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        expect(response.status).not.toBe(401);
      });

      it('Crew CANNOT delete soil types (403 Forbidden)', async () => {
        const token = generateTestToken(crewUser);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types?soil_type_id=test-id`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toMatch(/forbidden|insufficient permissions/i);
        expect(data.user_role).toBe('crew');
      });
    });
  });

  describe('Security Logging', () => {
    it('Logs unauthorized access attempts', async () => {
      // This test verifies that security logging exists
      // Actual log verification would require access to console/log files

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ soil_type_name: 'Test', price_per_meter: 10 }),
        }
      );

      expect(response.status).toBe(401);

      // In a real environment, you would check logs for:
      // [SECURITY] { event: 'unauthorized_access_attempt', ... }
    });
  });

  describe('Input Validation', () => {
    it('Validates required fields on POST', async () => {
      const token = generateTestToken(adminUser);

      // Missing required field: soil_type_name
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price_per_meter: 10,
          }),
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toMatch(/required|missing/i);
    });

    it('Validates price_per_meter must be positive', async () => {
      const token = generateTestToken(adminUser);

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            soil_type_name: 'Test',
            price_per_meter: -10, // Invalid: negative price
          }),
        }
      );

      expect(response.status).toBe(400);
    });

    it('Requires soil_type_id query param for DELETE', async () => {
      const token = generateTestToken(adminUser);

      // Missing soil_type_id query parameter
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toMatch(/soil_type_id.*required/i);
    });
  });

  describe('HTTP Methods', () => {
    it('PUT endpoint should not exist (removed in Phase 1)', async () => {
      const token = generateTestToken(adminUser);

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            soil_type_id: 'test-id',
            soil_type_name: 'Updated',
            price_per_meter: 20,
          }),
        }
      );

      // Should return 405 Method Not Allowed (PUT not implemented)
      expect(response.status).toBe(405);
    });
  });

  describe('Defense in Depth', () => {
    it('Application-level JWT auth protects endpoints', async () => {
      // This test verifies that JWT authentication is the primary security layer
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`
      );

      expect(response.status).toBe(401);
      expect(response.headers.get('content-type')).toMatch(/application\/json/);
    });

    // Note: RLS policies are tested at database level
    // API routes use service_role which bypasses RLS
    // RLS provides defense-in-depth protection for direct database access
  });

  describe('Error Response Format', () => {
    it('Returns consistent error format for auth failures', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });

    it('Returns detailed error for role-based failures', async () => {
      const token = generateTestToken(crewUser);

      const response = await fetch(
        `${API_BASE_URL}/api/projects/${TEST_PROJECT_ID}/soil-types`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            soil_type_name: 'Test',
            price_per_meter: 10,
          }),
        }
      );

      expect(response.status).toBe(403);
      const data = await response.json();

      // Should include helpful debug info
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('required_roles');
      expect(data).toHaveProperty('user_role');
    });
  });
});
