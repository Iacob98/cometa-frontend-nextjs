import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateCrewExists, validateCrewMiddleware, clearCrewCache, getCrewCacheStats } from '../crew-validation';
import { NextResponse } from 'next/server';

// Mock the exec function
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('util', () => ({
  promisify: vi.fn((fn) => fn),
}));

// Mock execAsync
const mockExecAsync = vi.fn();
vi.mock('../crew-validation', async () => {
  const actual = await vi.importActual('../crew-validation');
  return {
    ...actual,
    execAsync: mockExecAsync,
  };
});

describe('Crew Validation Middleware', () => {
  beforeEach(() => {
    clearCrewCache();
    vi.clearAllMocks();
  });

  describe('validateCrewExists', () => {
    it('should return false for invalid crew ID format', async () => {
      const result = await validateCrewExists('');
      expect(result.exists).toBe(false);
      expect(result.error).toBe('Invalid crew ID format');
    });

    it('should return false for non-string crew ID', async () => {
      const result = await validateCrewExists(null as any);
      expect(result.exists).toBe(false);
      expect(result.error).toBe('Invalid crew ID format');
    });

    it('should return true for valid crew', async () => {
      const mockCrewId = '123e4567-e89b-12d3-a456-426614174000';
      mockExecAsync.mockResolvedValue({
        stdout: '123e4567-e89b-12d3-a456-426614174000 | Test Crew | t\n',
        stderr: '',
      });

      const result = await validateCrewExists(mockCrewId);
      expect(result.exists).toBe(true);
      expect(result.name).toBe('Test Crew');
    });

    it('should return false for non-existent crew', async () => {
      const mockCrewId = '123e4567-e89b-12d3-a456-426614174000';
      mockExecAsync.mockResolvedValue({
        stdout: '',
        stderr: '',
      });

      const result = await validateCrewExists(mockCrewId);
      expect(result.exists).toBe(false);
      expect(result.error).toBe('Crew not found or inactive');
    });

    it('should handle database errors gracefully', async () => {
      const mockCrewId = '123e4567-e89b-12d3-a456-426614174000';
      mockExecAsync.mockRejectedValue(new Error('Database connection failed'));

      const result = await validateCrewExists(mockCrewId);
      expect(result.exists).toBe(false);
      expect(result.error).toBe('Database connection error during crew validation');
    });

    it('should use cache for repeated requests', async () => {
      const mockCrewId = '123e4567-e89b-12d3-a456-426614174000';
      mockExecAsync.mockResolvedValue({
        stdout: '123e4567-e89b-12d3-a456-426614174000 | Test Crew | t\n',
        stderr: '',
      });

      // First call
      await validateCrewExists(mockCrewId);
      expect(mockExecAsync).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await validateCrewExists(mockCrewId);
      expect(mockExecAsync).toHaveBeenCalledTimes(1);

      const cacheStats = getCrewCacheStats();
      expect(cacheStats.size).toBe(1);
      expect(cacheStats.keys).toContain(mockCrewId);
    });
  });

  describe('validateCrewMiddleware', () => {
    it('should return null for valid crew', async () => {
      const mockCrewId = '123e4567-e89b-12d3-a456-426614174000';
      mockExecAsync.mockResolvedValue({
        stdout: '123e4567-e89b-12d3-a456-426614174000 | Test Crew | t\n',
        stderr: '',
      });

      const result = await validateCrewMiddleware(mockCrewId);
      expect(result).toBeNull();
    });

    it('should return error response for invalid crew', async () => {
      const mockCrewId = '123e4567-e89b-12d3-a456-426614174000';
      mockExecAsync.mockResolvedValue({
        stdout: '',
        stderr: '',
      });

      const result = await validateCrewMiddleware(mockCrewId);
      expect(result).toBeInstanceOf(NextResponse);

      if (result) {
        const response = await result.json();
        expect(response.error).toBe('Crew not found or inactive');
        expect(response.code).toBe('CREW_NOT_FOUND');
        expect(result.status).toBe(404);
      }
    });
  });

  describe('Cache Management', () => {
    it('should clear cache correctly', async () => {
      const mockCrewId = '123e4567-e89b-12d3-a456-426614174000';
      mockExecAsync.mockResolvedValue({
        stdout: '123e4567-e89b-12d3-a456-426614174000 | Test Crew | t\n',
        stderr: '',
      });

      await validateCrewExists(mockCrewId);
      expect(getCrewCacheStats().size).toBe(1);

      clearCrewCache();
      expect(getCrewCacheStats().size).toBe(0);
    });

    it('should provide correct cache statistics', async () => {
      const mockCrewId1 = '123e4567-e89b-12d3-a456-426614174001';
      const mockCrewId2 = '123e4567-e89b-12d3-a456-426614174002';

      mockExecAsync.mockResolvedValue({
        stdout: '123e4567-e89b-12d3-a456-426614174001 | Crew 1 | t\n',
        stderr: '',
      });

      await validateCrewExists(mockCrewId1);
      await validateCrewExists(mockCrewId2);

      const stats = getCrewCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain(mockCrewId1);
      expect(stats.keys).toContain(mockCrewId2);
      expect(typeof stats.oldestEntry).toBe('number');
    });
  });
});