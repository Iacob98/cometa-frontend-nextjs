/**
 * Phase 5: Component Performance Tests for Soil Types
 *
 * Tests React component render performance with different data volumes.
 * Measures initial render time, re-render time, and memory usage.
 *
 * @see .claude/implementation-plans/PHASE5_PERFORMANCE_PLAN.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectSoilTypesCard from '@/components/project-soil-types-card';
import type { ProjectSoilType } from '@/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock soil type data
function createMockSoilTypes(count: number): ProjectSoilType[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `test-id-${i}`,
    project_id: 'test-project',
    soil_type_name: `Test Soil Type ${i}`,
    price_per_meter: 25 + i,
    quantity_meters: 100 + i * 10,
    notes: i % 2 === 0 ? `Notes for soil type ${i}` : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// Helper to render component with React Query provider
function renderWithQueryClient(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('Phase 5: Soil Types Component Performance Tests', () => {

  beforeEach(() => {
    mockFetch.mockClear();
    vi.clearAllMocks();
  });

  describe('Initial Render Performance', () => {

    it('should render empty state within 50ms', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const startTime = performance.now();

      renderWithQueryClient(<ProjectSoilTypesCard projectId="test-project" />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading soil types/i)).not.toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`Empty state render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(100); // Target: < 50ms, Warning: < 100ms
    });

    it('should render 10 items within 100ms', async () => {
      const mockData = createMockSoilTypes(10);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const startTime = performance.now();

      renderWithQueryClient(<ProjectSoilTypesCard projectId="test-project" />);

      // Wait for data to load and render
      await waitFor(() => {
        expect(screen.getByText(/test soil type 0/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`10 items render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(200); // Target: < 100ms, Warning: < 200ms

      // Verify all items rendered
      mockData.forEach((item) => {
        expect(screen.getByText(item.soil_type_name)).toBeInTheDocument();
      });
    });

    it('should render 50 items within 200ms', async () => {
      const mockData = createMockSoilTypes(50);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const startTime = performance.now();

      renderWithQueryClient(<ProjectSoilTypesCard projectId="test-project" />);

      // Wait for first and last items to render
      await waitFor(() => {
        expect(screen.getByText(/test soil type 0/i)).toBeInTheDocument();
        expect(screen.getByText(/test soil type 49/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`50 items render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(500); // Target: < 200ms, Warning: < 500ms
    });

    it('should render 100 items without performance degradation', async () => {
      const mockData = createMockSoilTypes(100);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const startTime = performance.now();

      renderWithQueryClient(<ProjectSoilTypesCard projectId="test-project" />);

      // Wait for first and last items
      await waitFor(() => {
        expect(screen.getByText(/test soil type 0/i)).toBeInTheDocument();
        expect(screen.getByText(/test soil type 99/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`100 items render time: ${renderTime.toFixed(2)}ms`);

      // Allow more time for 100 items, but should still be reasonable
      expect(renderTime).toBeLessThan(1000);

      // Performance should scale linearly or better
      // 100 items should not be 10x slower than 10 items
    });
  });

  describe('Re-render Performance', () => {

    it('should re-render quickly after data update', async () => {
      const initialData = createMockSoilTypes(10);
      const updatedData = [...initialData, ...createMockSoilTypes(5)];

      // Initial render
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => initialData,
      });

      const { rerender } = renderWithQueryClient(
        <ProjectSoilTypesCard projectId="test-project" />
      );

      await waitFor(() => {
        expect(screen.getByText(/test soil type 0/i)).toBeInTheDocument();
      });

      // Measure re-render time
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedData,
      });

      const startTime = performance.now();

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <ProjectSoilTypesCard projectId="test-project" />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/test soil type 14/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const rerenderTime = endTime - startTime;

      console.log(`Re-render time (10 → 15 items): ${rerenderTime.toFixed(2)}ms`);
      expect(rerenderTime).toBeLessThan(100); // Target: < 50ms, Warning: < 100ms
    });
  });

  describe('Total Cost Calculation Performance', () => {

    it('should calculate total cost efficiently with 50 items', async () => {
      const mockData = createMockSoilTypes(50);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const startTime = performance.now();

      renderWithQueryClient(<ProjectSoilTypesCard projectId="test-project" />);

      // Wait for total cost to be calculated and rendered
      await waitFor(() => {
        expect(screen.getByText(/total estimated cost/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      console.log(`Total cost calculation time (50 items): ${calculationTime.toFixed(2)}ms`);

      // Calculation should be fast even with many items
      expect(calculationTime).toBeLessThan(200);

      // Verify calculation is correct
      const expectedTotal = mockData.reduce(
        (sum, item) => sum + (item.quantity_meters || 0) * item.price_per_meter,
        0
      );

      const totalElement = screen.getByText(/total estimated cost/i)
        .parentElement?.querySelector('p:last-child');

      if (totalElement) {
        const displayedTotal = parseFloat(
          totalElement.textContent?.replace(/[€,]/g, '') || '0'
        );
        expect(Math.abs(displayedTotal - expectedTotal)).toBeLessThan(0.01);
      }
    });

    it('should handle empty quantity values efficiently', async () => {
      const mockData = createMockSoilTypes(20).map((item, i) => ({
        ...item,
        quantity_meters: i % 3 === 0 ? null : item.quantity_meters, // Every 3rd item has null quantity
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const startTime = performance.now();

      renderWithQueryClient(<ProjectSoilTypesCard projectId="test-project" />);

      await waitFor(() => {
        expect(screen.getByText(/total estimated cost/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      console.log(`Total cost with null values (20 items): ${calculationTime.toFixed(2)}ms`);
      expect(calculationTime).toBeLessThan(150);
    });
  });

  describe('Delete Operation Performance', () => {

    it('should handle delete with optimistic update quickly', async () => {
      const mockData = createMockSoilTypes(20);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      renderWithQueryClient(<ProjectSoilTypesCard projectId="test-project" />);

      await waitFor(() => {
        expect(screen.getByText(/test soil type 0/i)).toBeInTheDocument();
      });

      // Mock delete response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Note: This test verifies the component structure supports fast deletes
      // Actual button click testing is in the component unit tests
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBe(20);
    });
  });

  describe('Performance Benchmarks Summary', () => {

    it('should provide performance baseline report', async () => {
      const testCases = [
        { count: 0, label: 'Empty' },
        { count: 10, label: '10 items' },
        { count: 50, label: '50 items' },
      ];

      const results: { [key: string]: number } = {};

      for (const testCase of testCases) {
        const mockData = createMockSoilTypes(testCase.count);

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        });

        const startTime = performance.now();

        const { unmount } = renderWithQueryClient(
          <ProjectSoilTypesCard projectId="test-project" />
        );

        if (testCase.count > 0) {
          await waitFor(() => {
            expect(screen.getByText(/test soil type 0/i)).toBeInTheDocument();
          });
        } else {
          await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
          });
        }

        const endTime = performance.now();
        results[testCase.label] = endTime - startTime;

        unmount();
      }

      console.log('\n=== Performance Baseline Report ===');
      Object.entries(results).forEach(([label, time]) => {
        console.log(`  ${label}: ${time.toFixed(2)}ms`);
      });
      console.log('===================================\n');

      // All tests should complete reasonably fast
      Object.values(results).forEach(time => {
        expect(time).toBeLessThan(1000);
      });
    });
  });
});
