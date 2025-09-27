import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('px-2', true && 'py-1', false && 'bg-red-500')).toBe('px-2 py-1');
  });

  it('should handle Tailwind class conflicts', () => {
    expect(cn('px-2 px-4')).toBe('px-4');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn(null, undefined)).toBe('');
  });
});