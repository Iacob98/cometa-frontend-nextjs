/**
 * @jest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectSoilTypesCard from '@/components/project-soil-types-card';
import type { ProjectSoilType } from '@/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test data
const mockProjectId = '8cd3a97f-e911-42c3-b145-f9f5c1c6340a';

const mockSoilTypes: ProjectSoilType[] = [
  {
    id: '1',
    project_id: mockProjectId,
    soil_type_name: 'Sandy Soil',
    price_per_meter: 15.5,
    quantity_meters: 100,
    notes: 'Easy to dig',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    project_id: mockProjectId,
    soil_type_name: 'Clay Soil',
    price_per_meter: 25.0,
    quantity_meters: 50,
    notes: 'Difficult terrain',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Helper to render component with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ProjectSoilTypesCard', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Loading State', () => {
    it('renders loading state correctly', () => {
      mockFetch.mockImplementation(() =>
        new Promise(() => {}) // Never resolves
      );

      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no soil types exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText(/no soil types/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoilTypes,
      });
    });

    it('renders soil types list with data', async () => {
      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText('Sandy Soil')).toBeInTheDocument();
        expect(screen.getByText('Clay Soil')).toBeInTheDocument();
      });

      // Check prices are displayed
      expect(screen.getByText(/15\.50.*€/)).toBeInTheDocument();
      expect(screen.getByText(/25\.00.*€/)).toBeInTheDocument();

      // Check quantities are displayed
      expect(screen.getByText(/100.*m/)).toBeInTheDocument();
      expect(screen.getByText(/50.*m/)).toBeInTheDocument();
    });

    it('calculates total cost correctly', async () => {
      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        // Total: (15.5 * 100) + (25.0 * 50) = 1550 + 1250 = 2800
        expect(screen.getByText(/2,800\.00.*€/)).toBeInTheDocument();
      });
    });

    it('displays notes when available', async () => {
      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText('Easy to dig')).toBeInTheDocument();
        expect(screen.getByText('Difficult terrain')).toBeInTheDocument();
      });
    });
  });

  describe('Add Soil Type Dialog', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
    });

    it('opens add dialog on button click', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText(/no soil types/i)).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add soil type/i });
      await user.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/soil type name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price per meter/i)).toBeInTheDocument();
    });

    it('validates required fields before submission', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText(/no soil types/i)).toBeInTheDocument();
      });

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add soil type/i });
      await user.click(addButton);

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /add/i });
      await user.click(submitButton);

      // Dialog should still be open (validation failed)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('submits new soil type with valid data', async () => {
      const user = userEvent.setup();

      // Mock initial fetch (empty)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText(/no soil types/i)).toBeInTheDocument();
      });

      // Open dialog
      const addButton = screen.getByRole('button', { name: /add soil type/i });
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText(/soil type name/i), 'Rocky Soil');
      await user.type(screen.getByLabelText(/price per meter/i), '30.00');
      await user.type(screen.getByLabelText(/quantity/i), '75');
      await user.type(screen.getByLabelText(/notes/i), 'Very hard');

      // Mock POST request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '3',
          project_id: mockProjectId,
          soil_type_name: 'Rocky Soil',
          price_per_meter: 30.0,
          quantity_meters: 75,
          notes: 'Very hard',
        }),
      });

      // Mock refetch after mutation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          id: '3',
          project_id: mockProjectId,
          soil_type_name: 'Rocky Soil',
          price_per_meter: 30.0,
          quantity_meters: 75,
          notes: 'Very hard',
        }],
      });

      // Submit
      const submitButton = screen.getByRole('button', { name: /add/i });
      await user.click(submitButton);

      // Wait for mutation and refetch
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/projects/${mockProjectId}/soil-types`,
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Rocky Soil'),
          })
        );
      });
    });
  });

  describe('Delete Soil Type', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSoilTypes,
      });
    });

    it('deletes soil type after confirmation', async () => {
      const user = userEvent.setup();

      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText('Sandy Soil')).toBeInTheDocument();
      });

      // Find and click delete button for first soil type
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

      // Mock DELETE request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Mock refetch after deletion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockSoilTypes[1]], // Only second item remains
      });

      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/projects/${mockProjectId}/soil-types?soil_type_id=1`),
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      confirmSpy.mockRestore();
    });

    it('does not delete if user cancels confirmation', async () => {
      const user = userEvent.setup();

      // Mock window.confirm to return false
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText('Sandy Soil')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalled();

      // DELETE should not be called
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only initial GET

      confirmSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('handles fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('handles API errors during creation', async () => {
      const user = userEvent.setup();

      // Mock initial fetch (empty)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      renderWithQueryClient(<ProjectSoilTypesCard projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText(/no soil types/i)).toBeInTheDocument();
      });

      // Open dialog and fill form
      await user.click(screen.getByRole('button', { name: /add soil type/i }));
      await user.type(screen.getByLabelText(/soil type name/i), 'Test');
      await user.type(screen.getByLabelText(/price per meter/i), '10');

      // Mock failed POST
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid data' }),
      });

      await user.click(screen.getByRole('button', { name: /add/i }));

      // Toast should show error
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/soil-types'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });
  });

  describe('Query Cache Updates', () => {
    it('invalidates query cache after successful mutation', async () => {
      const user = userEvent.setup();
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Mock initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(
        <QueryClientProvider client={queryClient}>
          <ProjectSoilTypesCard projectId={mockProjectId} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/no soil types/i)).toBeInTheDocument();
      });

      // Open dialog and add soil type
      await user.click(screen.getByRole('button', { name: /add soil type/i }));
      await user.type(screen.getByLabelText(/soil type name/i), 'Test');
      await user.type(screen.getByLabelText(/price per meter/i), '10');

      // Mock POST
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', soil_type_name: 'Test', price_per_meter: 10 }),
      });

      // Mock refetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '1', soil_type_name: 'Test', price_per_meter: 10 }],
      });

      await user.click(screen.getByRole('button', { name: /add/i }));

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['project-soil-types', mockProjectId],
        });
      });
    });
  });
});
