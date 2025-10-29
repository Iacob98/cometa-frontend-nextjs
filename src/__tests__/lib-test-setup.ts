/**
 * Minimal setup file for pure unit tests (lib utilities)
 * Does NOT import MSW or Testing Library
 */

import { expect, vi } from 'vitest';

// Mock localStorage for tests that might need it
const localStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage for tests that might need it
const sessionStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});
