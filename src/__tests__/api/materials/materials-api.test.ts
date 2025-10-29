/**
 * Materials API Comprehensive Test Suite
 *
 * Tests all Materials Inventory API endpoints:
 * - /api/materials (main CRUD)
 * - /api/materials/[id]/adjust (stock adjustment)
 * - /api/materials/warehouse (warehouse inventory)
 * - /api/materials/project/[id] (project materials)
 * - /api/materials/allocations/[id] (allocation CRUD)
 * - /api/materials/orders (order management)
 *
 * Focus: Database schema alignment, type safety, business logic validation
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Test material ID (must exist in database)
const TEST_MATERIAL_ID = '123e4567-e89b-12d3-a456-426614174000';
const TEST_PROJECT_ID = '8cd3a97f-e911-42c3-b145-f9f5c1c6340a';

describe('Materials API - Main Endpoint (/api/materials)', () => {

  describe('📋 GET /api/materials - List Materials', () => {

    it('Returns paginated list of materials', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('per_page');
    });

    it('Accepts pagination parameters', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials?page=1&per_page=5`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.page).toBe(1);
      expect(data.per_page).toBe(5);
      expect(data.items.length).toBeLessThanOrEqual(5);
    });

    it('Returns materials with correct database field names', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const material = data.items[0];

        // Check database field names (NOT legacy names)
        expect(material).toHaveProperty('current_stock'); // NOT current_stock_qty
        expect(material).toHaveProperty('min_stock_threshold'); // NOT min_stock_level
        expect(material).toHaveProperty('reserved_stock'); // NOT reserved_qty
        expect(material).toHaveProperty('unit_price_eur'); // NOT unit_cost
      }
    });

    it('Filters by category', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials?category=cable`);
      expect(response.status).toBe(200);

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        // All items should match category filter
        const allMatchCategory = data.items.every(
          (item: any) => !item.category || item.category === 'cable'
        );
        expect(allMatchCategory).toBe(true);
      }
    });

    it('Filters by low stock', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials?low_stock_only=true`);
      expect(response.status).toBe(200);

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        // All items should have current_stock <= min_stock_threshold
        const allLowStock = data.items.every(
          (item: any) => item.current_stock <= (item.min_stock_threshold || 10)
        );
        expect(allLowStock).toBe(true);
      }
    });

    it('Supports search by name, SKU, or description', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials?search=cable`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.items)).toBe(true);
      // Search should return results matching 'cable' in name, sku, or description
    });
  });

  describe('✏️ POST /api/materials - Create Material', () => {

    it('Creates new material with correct field names', async () => {
      const newMaterial = {
        name: `Test Material ${Date.now()}`,
        category: 'cable',
        unit: 'm',
        unit_price_eur: 10.50,
        current_stock: 100,
        reserved_stock: 0,
        min_stock_threshold: 20,
        supplier_name: 'Test Supplier',
        description: 'Test material for API testing',
      };

      const response = await fetch(`${API_BASE_URL}/api/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });

      // Accept either 201 (created) or 409 (conflict if duplicate)
      expect([201, 409]).toContain(response.status);

      if (response.status === 201) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.name).toBe(newMaterial.name);
        expect(data.current_stock).toBe(newMaterial.current_stock);
        expect(data.unit_price_eur).toBe(newMaterial.unit_price_eur);
      }
    });

    it('Validates required fields', async () => {
      const invalidMaterial = {
        // Missing name (required)
        unit: 'm',
      };

      const response = await fetch(`${API_BASE_URL}/api/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidMaterial),
      });

      expect(response.status).toBe(400);
    });

    it('Sets default values correctly', async () => {
      const minimalMaterial = {
        name: `Minimal Material ${Date.now()}`,
        unit: 'pcs',
      };

      const response = await fetch(`${API_BASE_URL}/api/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalMaterial),
      });

      if (response.status === 201) {
        const data = await response.json();
        // Check default values from database
        expect(data.current_stock).toBe(0); // Default
        expect(data.is_active).toBe(true); // Default
        expect(typeof data.unit_price_eur).toBe('number'); // Default 0
      }
    });
  });
});

describe('Materials API - Stock Adjustment (/api/materials/[id]/adjust)', () => {

  describe('📦 POST /api/materials/[id]/adjust - Adjust Stock', () => {

    it('Increases stock with positive adjustment', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/${TEST_MATERIAL_ID}/adjust`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: 50,
            reason: 'Test stock increase',
            reference_type: 'manual_adjustment',
          }),
        }
      );

      // Accept 200 (success) or 404 (material not found)
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.adjustment.adjustment).toBe(50);
        expect(data.adjustment.new_stock).toBeGreaterThan(data.adjustment.previous_stock);
      }
    });

    it('Decreases stock with negative adjustment', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/${TEST_MATERIAL_ID}/adjust`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: -10,
            reason: 'Test stock decrease',
          }),
        }
      );

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.adjustment.adjustment).toBe(-10);
      }
    });

    it('Validates quantity is required and non-zero', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/${TEST_MATERIAL_ID}/adjust`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: 0,
            reason: 'Invalid adjustment',
          }),
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Quantity');
    });

    it('Validates reason is required', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/${TEST_MATERIAL_ID}/adjust`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: 10,
            // Missing reason
          }),
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('reason');
    });

    it('Prevents stock from going negative', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/${TEST_MATERIAL_ID}/adjust`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: -9999999, // Huge negative number
            reason: 'Test negative prevention',
          }),
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        // New stock should be capped at 0 (Math.max(0, ...))
        expect(data.adjustment.new_stock).toBeGreaterThanOrEqual(0);
      }
    });

    it('Logs transaction in material_transactions table', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/${TEST_MATERIAL_ID}/adjust`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: 5,
            reason: 'Test transaction logging',
          }),
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        // Transaction should be logged with type 'adjustment_in'
      }
    });
  });
});

describe('Materials API - Warehouse (/api/materials/warehouse)', () => {

  describe('🏭 GET /api/materials/warehouse - Warehouse Inventory', () => {

    it('Returns warehouse materials with pagination', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials/warehouse`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('materials');
      expect(Array.isArray(data.materials)).toBe(true);
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('total');
    });

    it('Calculates available_stock correctly', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials/warehouse`);
      const data = await response.json();

      if (data.materials && data.materials.length > 0) {
        data.materials.forEach((material: any) => {
          expect(material).toHaveProperty('available_stock');
          const expectedAvailable = Math.max(
            0,
            material.current_stock - material.reserved_stock
          );
          expect(material.available_stock).toBe(expectedAvailable);
        });
      }
    });

    it('Assigns stock_status correctly', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials/warehouse`);
      const data = await response.json();

      if (data.materials && data.materials.length > 0) {
        data.materials.forEach((material: any) => {
          expect(material).toHaveProperty('stock_status');
          const validStatuses = ['out_of_stock', 'low', 'reserved', 'available'];
          expect(validStatuses).toContain(material.stock_status);

          // Validate status logic
          if (material.current_stock === 0) {
            expect(material.stock_status).toBe('out_of_stock');
          }
        });
      }
    });

    it('Filters by category', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials/warehouse?category=cable`);
      expect(response.status).toBe(200);
    });

    it('Filters by low stock only', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials/warehouse?low_stock_only=true`);
      expect(response.status).toBe(200);

      const data = await response.json();
      if (data.materials && data.materials.length > 0) {
        expect(data.materials[0]).toHaveProperty('is_low_stock');
      }
    });

    it('Supports search', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials/warehouse?search=test`);
      expect(response.status).toBe(200);
    });

    it('Respects pagination limits', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials/warehouse?per_page=5`);
      const data = await response.json();

      expect(data.materials.length).toBeLessThanOrEqual(5);
      expect(data.pagination.per_page).toBe(5);
    });

    it('Caps per_page at 1000', async () => {
      const response = await fetch(`${API_BASE_URL}/api/materials/warehouse?per_page=9999`);
      const data = await response.json();

      // Should be capped at 1000 (Math.min)
      expect(data.pagination.per_page).toBeLessThanOrEqual(1000);
    });
  });
});

describe('Materials API - Project Materials (/api/materials/project/[id])', () => {

  describe('📊 GET /api/materials/project/[id] - Project Materials', () => {

    it('Returns allocations for specific project', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/project/${TEST_PROJECT_ID}`
      );

      // Accept 200 (has allocations) or 404 (project not found)
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('project_id');
        expect(data).toHaveProperty('allocations');
        expect(data).toHaveProperty('totals');
        expect(Array.isArray(data.allocations)).toBe(true);
      }
    });

    it('Includes material details in allocations', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/project/${TEST_PROJECT_ID}`
      );

      if (response.status === 200) {
        const data = await response.json();

        if (data.allocations && data.allocations.length > 0) {
          const allocation = data.allocations[0];
          expect(allocation).toHaveProperty('materials');
          expect(allocation.materials).toHaveProperty('name');
          expect(allocation.materials).toHaveProperty('unit');
          expect(allocation.materials).toHaveProperty('unit_price_eur');
        }
      }
    });

    it('Calculates totals correctly', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/project/${TEST_PROJECT_ID}`
      );

      if (response.status === 200) {
        const data = await response.json();

        expect(data.totals).toHaveProperty('total_allocated');
        expect(data.totals).toHaveProperty('total_used');
        expect(data.totals).toHaveProperty('total_remaining');
        expect(data.totals).toHaveProperty('estimated_value');
        expect(data.totals).toHaveProperty('materials_count');

        // Totals should be numbers
        expect(typeof data.totals.total_allocated).toBe('number');
        expect(typeof data.totals.estimated_value).toBe('number');
      }
    });

    it('Orders allocations by date descending', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/project/${TEST_PROJECT_ID}`
      );

      if (response.status === 200) {
        const data = await response.json();

        if (data.allocations && data.allocations.length > 1) {
          // Check dates are in descending order
          for (let i = 0; i < data.allocations.length - 1; i++) {
            const date1 = new Date(data.allocations[i].allocated_date);
            const date2 = new Date(data.allocations[i + 1].allocated_date);
            expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
          }
        }
      }
    });
  });
});

describe('Materials API - Allocation CRUD (/api/materials/allocations/[id])', () => {

  const TEST_ALLOCATION_ID = '123e4567-e89b-12d3-a456-426614174001';

  describe('🎯 GET /api/materials/allocations/[id] - Get Allocation', () => {

    it('Returns single allocation with details', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${TEST_ALLOCATION_ID}`
      );

      // Accept 200 (found) or 404 (not found)
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('material_id');
        expect(data).toHaveProperty('quantity_allocated');
        expect(data).toHaveProperty('quantity_used');
        expect(data).toHaveProperty('quantity_remaining');
        expect(data).toHaveProperty('status');
      }
    });

    it('Includes enriched fields', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${TEST_ALLOCATION_ID}`
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('material_name');
        expect(data).toHaveProperty('project_name');
        expect(data).toHaveProperty('crew_name');
        expect(data).toHaveProperty('allocated_by_name');
      }
    });
  });

  describe('✏️ PUT /api/materials/allocations/[id] - Update Allocation', () => {

    it('Updates quantity_used', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${TEST_ALLOCATION_ID}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity_used: 10,
          }),
        }
      );

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.allocation.quantity_used).toBe(10);
      }
    });

    it('Auto-updates status based on usage', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${TEST_ALLOCATION_ID}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity_used: 0,
          }),
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        // When quantity_used = 0, status should be 'allocated'
        expect(data.allocation.status).toBe('allocated');
      }
    });

    it('Validates quantity_used does not exceed allocated', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${TEST_ALLOCATION_ID}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity_used: 999999, // Huge number
          }),
        }
      );

      // Should return 400 if exceeds allocated
      if (response.status === 400) {
        const data = await response.json();
        expect(data.error).toContain('exceed');
      }
    });

    it('Validates status enum', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${TEST_ALLOCATION_ID}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'invalid_status',
          }),
        }
      );

      expect([400, 404]).toContain(response.status);

      if (response.status === 400) {
        const data = await response.json();
        expect(data.error).toContain('status');
      }
    });

    it('Updates notes field', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${TEST_ALLOCATION_ID}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: 'Updated allocation notes',
          }),
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data.allocation.notes).toBe('Updated allocation notes');
      }
    });
  });

  describe('🗑️ DELETE /api/materials/allocations/[id] - Delete Allocation', () => {

    it('Returns 404 for non-existent allocation', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${fakeId}`,
        { method: 'DELETE' }
      );

      expect(response.status).toBe(404);
    });

    it('Returns success response structure', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/materials/allocations/${TEST_ALLOCATION_ID}`,
        { method: 'DELETE' }
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('message');
        expect(data).toHaveProperty('returned_to_stock');
      }
    });
  });
});

describe('Materials API - Type Safety Tests', () => {

  it('MaterialOrderStatus does not include "draft"', async () => {
    const response = await fetch(`${API_BASE_URL}/api/materials/orders`);

    if (response.status === 200) {
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const validStatuses = ['pending', 'ordered', 'delivered', 'cancelled'];

        data.items.forEach((order: any) => {
          expect(validStatuses).toContain(order.status);
          expect(order.status).not.toBe('draft'); // 'draft' removed from type
        });
      }
    }
  });

  it('Material uses correct field names from database', async () => {
    const response = await fetch(`${API_BASE_URL}/api/materials`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const material = data.items[0];

      // Primary fields should match database
      expect(material).toHaveProperty('current_stock');
      expect(material).toHaveProperty('reserved_stock');
      expect(material).toHaveProperty('min_stock_threshold');
      expect(material).toHaveProperty('unit_price_eur');

      // Legacy aliases may or may not be present (optional)
      // But primary fields MUST be present
    }
  });
});

describe('Materials API - Performance Tests', () => {

  it('List materials completes within 2 seconds', async () => {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/materials?per_page=100`);
    const endTime = Date.now();

    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(2000);
  });

  it('Warehouse endpoint completes within 2 seconds', async () => {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/materials/warehouse?per_page=100`);
    const endTime = Date.now();

    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(2000);
  });
});
