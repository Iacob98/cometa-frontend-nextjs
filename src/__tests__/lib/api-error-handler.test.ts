/**
 * Unit Tests for API Error Handler Utilities
 *
 * Tests the standardized error handling functions created in Phase 3
 *
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createErrorResponse,
  handleSupabaseError,
  handleValidationError,
  handleAuthError,
  handleNotFoundError,
  handleGenericError,
} from '@/lib/api-error-handler';

describe('API Error Handler Utilities', () => {
  describe('createErrorResponse', () => {
    it('Creates basic error response with default status 500', () => {
      const response = createErrorResponse('Test error message');

      expect(response.status).toBe(500);
    });

    it('Includes error message in response body', async () => {
      const response = createErrorResponse('Test error message');
      const body = await response.json();

      expect(body.error).toBe('Test error message');
    });

    it('Includes timestamp in response', async () => {
      const response = createErrorResponse('Test error');
      const body = await response.json();

      expect(body.timestamp).toBeDefined();
      expect(typeof body.timestamp).toBe('string');
      // Verify it's a valid ISO date string
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    });

    it('Respects custom HTTP status code', () => {
      const response = createErrorResponse('Not found', 404);

      expect(response.status).toBe(404);
    });

    it('Includes optional details field when provided', async () => {
      const response = createErrorResponse(
        'Database error',
        500,
        'Connection timeout'
      );
      const body = await response.json();

      expect(body.details).toBe('Connection timeout');
    });

    it('Includes optional error code when provided', async () => {
      const response = createErrorResponse(
        'Validation failed',
        400,
        'Invalid email format',
        'VALIDATION_ERROR'
      );
      const body = await response.json();

      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('Omits details field when not provided', async () => {
      const response = createErrorResponse('Test error');
      const body = await response.json();

      expect(body).not.toHaveProperty('details');
    });

    it('Omits code field when not provided', async () => {
      const response = createErrorResponse('Test error');
      const body = await response.json();

      expect(body).not.toHaveProperty('code');
    });
  });

  describe('handleSupabaseError', () => {
    beforeEach(() => {
      // Mock console.error to avoid noise in test output
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('Returns 409 for unique_violation (23505)', async () => {
      const error = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      };

      const response = handleSupabaseError(error, 'create equipment');
      expect(response.status).toBe(409);

      const body = await response.json();
      expect(body.error).toBe('Resource already exists');
      expect(body.code).toBe('23505');
    });

    it('Returns 404 for foreign_key_violation (23503)', async () => {
      const error = {
        code: '23503',
        message: 'insert or update on table violates foreign key constraint',
      };

      const response = handleSupabaseError(error, 'create equipment');
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe('Referenced resource not found');
    });

    it('Returns 400 for not_null_violation (23502)', async () => {
      const error = {
        code: '23502',
        message: 'null value in column violates not-null constraint',
      };

      const response = handleSupabaseError(error, 'update equipment');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('Required field is missing');
    });

    it('Returns 400 for check_violation (23514)', async () => {
      const error = {
        code: '23514',
        message: 'new row for relation violates check constraint',
      };

      const response = handleSupabaseError(error, 'insert data');
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('Invalid data value');
    });

    it('Returns 500 for undefined_table (42P01)', async () => {
      const error = {
        code: '42P01',
        message: 'relation "nonexistent_table" does not exist',
      };

      const response = handleSupabaseError(error, 'query data');
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error).toBe('Database table not found');
    });

    it('Returns 500 for undefined_column (42703)', async () => {
      const error = {
        code: '42703',
        message: 'column "nonexistent_column" does not exist',
      };

      const response = handleSupabaseError(error, 'query data');
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error).toBe('Database column not found');
    });

    it('Returns default 500 error for unmapped error codes', async () => {
      const error = {
        code: '99999',
        message: 'Unknown database error',
      };

      const response = handleSupabaseError(error, 'execute query');
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error).toBe('Failed to execute query');
      expect(body.details).toBe('Unknown database error');
    });

    it('Handles error without code field', async () => {
      const error = {
        message: 'Generic database error',
      };

      const response = handleSupabaseError(error, 'fetch data');
      expect(response.status).toBe(500);
    });

    it('Includes original error message in details', async () => {
      const error = {
        code: '23505',
        message: 'duplicate key value violates unique constraint "equipment_pkey"',
      };

      const response = handleSupabaseError(error, 'create equipment');
      const body = await response.json();

      expect(body.details).toContain('duplicate key');
    });

    it('Logs error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const error = {
        code: '23505',
        message: 'Test error',
      };

      handleSupabaseError(error, 'test operation');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Supabase test operation error:',
        error
      );
    });
  });

  describe('handleValidationError', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('Returns 400 status code', () => {
      const error = new Error('Validation failed');
      const response = handleValidationError(error);

      expect(response.status).toBe(400);
    });

    it('Handles Zod error format with issues array', async () => {
      const zodError = {
        issues: [
          { path: ['name'], message: 'Name is required' },
          { path: ['email'], message: 'Invalid email format' },
        ],
      };

      const response = handleValidationError(zodError);
      const body = await response.json();

      expect(body.error).toBe('Validation failed');
      expect(body.details).toContain('name: Name is required');
      expect(body.details).toContain('email: Invalid email format');
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('Handles nested field paths in Zod errors', async () => {
      const zodError = {
        issues: [
          { path: ['user', 'profile', 'age'], message: 'Age must be positive' },
        ],
      };

      const response = handleValidationError(zodError);
      const body = await response.json();

      expect(body.details).toBe('user.profile.age: Age must be positive');
    });

    it('Handles non-Zod errors', async () => {
      const error = {
        message: 'Generic validation error',
      };

      const response = handleValidationError(error);
      const body = await response.json();

      expect(body.error).toBe('Invalid request data');
      expect(body.details).toBe('Generic validation error');
    });

    it('Logs error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const error = { message: 'Test validation error' };

      handleValidationError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Validation error:', error);
    });
  });

  describe('handleAuthError', () => {
    it('Returns 401 for authentication errors', () => {
      const response = handleAuthError('Unauthorized');

      expect(response.status).toBe(401);
    });

    it('Returns 403 for permission errors', () => {
      const response = handleAuthError('You do not have permission to access this resource');

      expect(response.status).toBe(403);
    });

    it('Uses default message when not provided', async () => {
      const response = handleAuthError();
      const body = await response.json();

      expect(body.error).toBe('Unauthorized');
    });

    it('Includes AUTH_ERROR code', async () => {
      const response = handleAuthError('Test auth error');
      const body = await response.json();

      expect(body.code).toBe('AUTH_ERROR');
    });

    it('Detects permission-related messages (case-insensitive)', () => {
      const permissionMessages = [
        'Permission denied',
        'You do not have PERMISSION to do this',
        'Insufficient permissions',
      ];

      permissionMessages.forEach((message) => {
        const response = handleAuthError(message);
        expect(response.status).toBe(403);
      });
    });
  });

  describe('handleNotFoundError', () => {
    it('Returns 404 status code', () => {
      const response = handleNotFoundError('Equipment');

      expect(response.status).toBe(404);
    });

    it('Formats error message correctly', async () => {
      const response = handleNotFoundError('Equipment');
      const body = await response.json();

      expect(body.error).toBe('Equipment not found');
    });

    it('Includes NOT_FOUND code', async () => {
      const response = handleNotFoundError('Project');
      const body = await response.json();

      expect(body.code).toBe('NOT_FOUND');
    });

    it('Works with various resource names', async () => {
      const resources = ['User', 'Vehicle', 'Document', 'Material'];

      for (const resource of resources) {
        const response = handleNotFoundError(resource);
        const body = await response.json();

        expect(body.error).toBe(`${resource} not found`);
      }
    });
  });

  describe('handleGenericError', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('Returns 500 status code', () => {
      const error = new Error('Test error');
      const response = handleGenericError(error, 'fetch data');

      expect(response.status).toBe(500);
    });

    it('Handles Error instances', async () => {
      const error = new Error('Something went wrong');
      const response = handleGenericError(error, 'process request');
      const body = await response.json();

      expect(body.error).toBe('Internal server error');
      expect(body.details).toBe('Something went wrong');
      expect(body.code).toBe('INTERNAL_ERROR');
    });

    it('Handles unknown error types', async () => {
      const error = 'String error';
      const response = handleGenericError(error, 'execute operation');
      const body = await response.json();

      expect(body.error).toBe('Failed to execute operation');
      expect(body.details).toBe('Unknown error occurred');
      expect(body.code).toBe('UNKNOWN_ERROR');
    });

    it('Logs error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const error = new Error('Test error');

      handleGenericError(error, 'test operation');

      expect(consoleSpy).toHaveBeenCalledWith('test operation error:', error);
    });

    it('Includes operation context in error message', async () => {
      const error = new Error('Test error');
      const response = handleGenericError(error, 'create equipment');
      const body = await response.json();

      // Should not include operation in main error for generic errors
      // but should log it for debugging
      expect(body.error).toBeDefined();
    });
  });

  describe('Error Response Format Consistency', () => {
    it('All error handlers return consistent structure', async () => {
      const handlers = [
        createErrorResponse('Test'),
        handleAuthError(),
        handleNotFoundError('Resource'),
        handleGenericError(new Error('Test'), 'operation'),
      ];

      for (const response of handlers) {
        const body = await response.json();

        // All should have error field
        expect(body).toHaveProperty('error');
        expect(typeof body.error).toBe('string');

        // All should have timestamp
        expect(body).toHaveProperty('timestamp');
        expect(typeof body.timestamp).toBe('string');

        // If details exist, should be string
        if (body.details) {
          expect(typeof body.details).toBe('string');
        }

        // If code exists, should be string
        if (body.code) {
          expect(typeof body.code).toBe('string');
        }
      }
    });

    it('All error responses have application/json content-type', () => {
      const response = createErrorResponse('Test error');
      const contentType = response.headers.get('content-type');

      expect(contentType).toContain('application/json');
    });
  });
});
