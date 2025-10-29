/**
 * Unit Tests for Pagination Utilities
 *
 * Tests the standardized pagination functions created in Phase 3
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  parsePaginationParams,
  createPaginationMeta,
  createPaginatedResponse,
  validatePagination,
} from '@/lib/pagination-utils';

describe('Pagination Utilities', () => {
  describe('parsePaginationParams', () => {
    it('Returns default values when no params provided', () => {
      const searchParams = new URLSearchParams('');
      const result = parsePaginationParams(searchParams);

      expect(result).toEqual({
        page: 1,
        per_page: 20,
        offset: 0,
      });
    });

    it('Parses custom page and per_page values', () => {
      const searchParams = new URLSearchParams('page=3&per_page=50');
      const result = parsePaginationParams(searchParams);

      expect(result).toEqual({
        page: 3,
        per_page: 50,
        offset: 100, // (3 - 1) * 50 = 100
      });
    });

    it('Uses custom default per_page when provided', () => {
      const searchParams = new URLSearchParams('page=2');
      const result = parsePaginationParams(searchParams, 10);

      expect(result).toEqual({
        page: 2,
        per_page: 10,
        offset: 10, // (2 - 1) * 10 = 10
      });
    });

    it('Clamps page to minimum of 1', () => {
      const searchParams = new URLSearchParams('page=-5');
      const result = parsePaginationParams(searchParams);

      expect(result.page).toBe(1);
      expect(result.offset).toBe(0);
    });

    it('Clamps page to minimum of 1 (zero case)', () => {
      const searchParams = new URLSearchParams('page=0');
      const result = parsePaginationParams(searchParams);

      expect(result.page).toBe(1);
      expect(result.offset).toBe(0);
    });

    it('Clamps per_page to minimum of 1', () => {
      const searchParams = new URLSearchParams('per_page=0');
      const result = parsePaginationParams(searchParams);

      expect(result.per_page).toBeGreaterThanOrEqual(1);
    });

    it('Clamps per_page to maximum of 100', () => {
      const searchParams = new URLSearchParams('per_page=500');
      const result = parsePaginationParams(searchParams);

      expect(result.per_page).toBeLessThanOrEqual(100);
      expect(result.per_page).toBe(100);
    });

    it('Handles invalid (non-numeric) page gracefully', () => {
      const searchParams = new URLSearchParams('page=abc');
      const result = parsePaginationParams(searchParams);

      // Should default to page 1 when parseInt returns NaN
      expect(result.page).toBe(1);
    });

    it('Handles invalid (non-numeric) per_page gracefully', () => {
      const searchParams = new URLSearchParams('per_page=xyz');
      const result = parsePaginationParams(searchParams);

      // Should default to 20 when parseInt returns NaN
      expect(result.per_page).toBe(20);
    });

    it('Calculates correct offset for various page/per_page combinations', () => {
      const testCases = [
        { page: 1, per_page: 10, expectedOffset: 0 },
        { page: 2, per_page: 10, expectedOffset: 10 },
        { page: 5, per_page: 20, expectedOffset: 80 },
        { page: 10, per_page: 50, expectedOffset: 450 },
      ];

      testCases.forEach(({ page, per_page, expectedOffset }) => {
        const searchParams = new URLSearchParams(`page=${page}&per_page=${per_page}`);
        const result = parsePaginationParams(searchParams);

        expect(result.offset).toBe(expectedOffset);
      });
    });
  });

  describe('createPaginationMeta', () => {
    it('Creates correct metadata for first page', () => {
      const meta = createPaginationMeta(1, 20, 100);

      expect(meta).toEqual({
        page: 1,
        per_page: 20,
        total: 100,
        total_pages: 5, // Math.ceil(100 / 20)
      });
    });

    it('Creates correct metadata for middle page', () => {
      const meta = createPaginationMeta(3, 20, 100);

      expect(meta).toEqual({
        page: 3,
        per_page: 20,
        total: 100,
        total_pages: 5,
      });
    });

    it('Creates correct metadata for last page', () => {
      const meta = createPaginationMeta(5, 20, 100);

      expect(meta).toEqual({
        page: 5,
        per_page: 20,
        total: 100,
        total_pages: 5,
      });
    });

    it('Handles zero total items', () => {
      const meta = createPaginationMeta(1, 20, 0);

      expect(meta).toEqual({
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0, // Math.ceil(0 / 20) = 0
      });
    });

    it('Calculates correct total_pages with remainder', () => {
      const meta = createPaginationMeta(1, 20, 95);

      expect(meta.total_pages).toBe(5); // Math.ceil(95 / 20) = 5
    });

    it('Handles single item case', () => {
      const meta = createPaginationMeta(1, 20, 1);

      expect(meta).toEqual({
        page: 1,
        per_page: 20,
        total: 1,
        total_pages: 1,
      });
    });
  });

  describe('createPaginatedResponse', () => {
    it('Creates correct response structure', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];

      const response = createPaginatedResponse(data, 1, 20, 100);

      expect(response).toEqual({
        data: data,
        meta: {
          page: 1,
          per_page: 20,
          total: 100,
          total_pages: 5,
        },
      });
    });

    it('Handles empty data array', () => {
      const response = createPaginatedResponse([], 1, 20, 0);

      expect(response.data).toEqual([]);
      expect(response.meta.total).toBe(0);
      expect(response.meta.total_pages).toBe(0);
    });

    it('Preserves data structure and types', () => {
      interface TestItem {
        id: number;
        name: string;
        active: boolean;
      }

      const data: TestItem[] = [
        { id: 1, name: 'Item 1', active: true },
        { id: 2, name: 'Item 2', active: false },
      ];

      const response = createPaginatedResponse(data, 1, 10, 50);

      expect(response.data).toHaveLength(2);
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('name');
      expect(response.data[0]).toHaveProperty('active');
      expect(typeof response.data[0].active).toBe('boolean');
    });
  });

  describe('validatePagination', () => {
    it('Does not throw for valid pagination parameters', () => {
      expect(() => validatePagination(1, 20)).not.toThrow();
      expect(() => validatePagination(5, 50)).not.toThrow();
      expect(() => validatePagination(100, 100)).not.toThrow();
    });

    it('Throws error when page is less than 1', () => {
      expect(() => validatePagination(0, 20)).toThrow('Page number must be at least 1');
      expect(() => validatePagination(-1, 20)).toThrow('Page number must be at least 1');
    });

    it('Throws error when per_page is less than 1', () => {
      expect(() => validatePagination(1, 0)).toThrow('Items per page must be between 1 and 100');
      expect(() => validatePagination(1, -5)).toThrow('Items per page must be between 1 and 100');
    });

    it('Throws error when per_page is greater than 100', () => {
      expect(() => validatePagination(1, 101)).toThrow('Items per page must be between 1 and 100');
      expect(() => validatePagination(1, 500)).toThrow('Items per page must be between 1 and 100');
    });

    it('Accepts exactly 100 items per page', () => {
      expect(() => validatePagination(1, 100)).not.toThrow();
    });

    it('Accepts exactly 1 item per page', () => {
      expect(() => validatePagination(1, 1)).not.toThrow();
    });
  });

  describe('Integration Tests - Full Workflow', () => {
    it('Parses params, validates, and creates response successfully', () => {
      const searchParams = new URLSearchParams('page=2&per_page=25');
      const { page, per_page, offset } = parsePaginationParams(searchParams);

      // Validate
      expect(() => validatePagination(page, per_page)).not.toThrow();

      // Create response
      const mockData = Array.from({ length: 25 }, (_, i) => ({
        id: offset + i + 1,
        name: `Item ${offset + i + 1}`,
      }));

      const response = createPaginatedResponse(mockData, page, per_page, 150);

      expect(response.data).toHaveLength(25);
      expect(response.meta.page).toBe(2);
      expect(response.meta.total_pages).toBe(6); // Math.ceil(150 / 25)
      expect(response.data[0].id).toBe(26); // offset 25 + 1
    });

    it('Handles edge case: last page with fewer items', () => {
      const searchParams = new URLSearchParams('page=5&per_page=20');
      const { page, per_page } = parsePaginationParams(searchParams);

      // Simulate last page with only 15 items
      const mockData = Array.from({ length: 15 }, (_, i) => ({
        id: 80 + i + 1, // Starting from item 81
        name: `Item ${80 + i + 1}`,
      }));

      const response = createPaginatedResponse(mockData, page, per_page, 95);

      expect(response.data).toHaveLength(15);
      expect(response.meta.total_pages).toBe(5);
      expect(response.meta.page).toBe(5);
    });
  });
});
