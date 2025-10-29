/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import type { ProjectSoilType } from '@/types';

/**
 * Calculate weighted average price per meter for soil types
 *
 * @param soilTypes - Array of soil types with prices and quantities
 * @returns Weighted average price rounded to 2 decimal places
 *
 * Logic:
 * - If array is empty: return 0
 * - If all quantities are 0 or undefined: simple average of prices
 * - Otherwise: weighted average = Σ(price × quantity) / Σ(quantity)
 */
export function calculateAveragePrice(soilTypes: ProjectSoilType[]): number {
  if (!soilTypes || soilTypes.length === 0) {
    return 0;
  }

  // Check if we have any quantities
  const hasQuantities = soilTypes.some(st => st.quantity_meters && st.quantity_meters > 0);

  if (!hasQuantities) {
    // Simple average: sum of prices / count
    const sum = soilTypes.reduce((acc, st) => acc + (st.price_per_meter || 0), 0);
    return Math.round((sum / soilTypes.length) * 100) / 100;
  }

  // Weighted average: Σ(price × quantity) / Σ(quantity)
  let totalWeightedPrice = 0;
  let totalQuantity = 0;

  for (const soilType of soilTypes) {
    const quantity = soilType.quantity_meters || 0;
    const price = soilType.price_per_meter || 0;

    if (quantity > 0) {
      totalWeightedPrice += price * quantity;
      totalQuantity += quantity;
    }
  }

  if (totalQuantity === 0) {
    return 0;
  }

  return Math.round((totalWeightedPrice / totalQuantity) * 100) / 100;
}

describe('calculateAveragePrice', () => {
  describe('Edge Cases', () => {
    it('returns 0 for empty array', () => {
      expect(calculateAveragePrice([])).toBe(0);
    });

    it('returns 0 for null input', () => {
      expect(calculateAveragePrice(null as any)).toBe(0);
    });

    it('returns 0 for undefined input', () => {
      expect(calculateAveragePrice(undefined as any)).toBe(0);
    });

    it('handles single soil type correctly', () => {
      const soilTypes: ProjectSoilType[] = [{
        id: '1',
        project_id: 'test',
        soil_type_name: 'Sandy',
        price_per_meter: 15.5,
        quantity_meters: 100,
        notes: null,
        created_at: '',
        updated_at: '',
      }];

      expect(calculateAveragePrice(soilTypes)).toBe(15.5);
    });
  });

  describe('Simple Average (No Quantities)', () => {
    it('calculates simple average when quantities are undefined', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 10,
          quantity_meters: undefined,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 20,
          quantity_meters: undefined,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // (10 + 20) / 2 = 15
      expect(calculateAveragePrice(soilTypes)).toBe(15);
    });

    it('calculates simple average when quantities are null', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 10,
          quantity_meters: null,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 30,
          quantity_meters: null,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // (10 + 30) / 2 = 20
      expect(calculateAveragePrice(soilTypes)).toBe(20);
    });

    it('calculates simple average when all quantities are zero', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 15,
          quantity_meters: 0,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 25,
          quantity_meters: 0,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // (15 + 25) / 2 = 20
      expect(calculateAveragePrice(soilTypes)).toBe(20);
    });
  });

  describe('Weighted Average', () => {
    it('calculates weighted average correctly', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 15.5,
          quantity_meters: 100,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 25.0,
          quantity_meters: 50,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // (15.5 * 100 + 25.0 * 50) / (100 + 50)
      // = (1550 + 1250) / 150
      // = 2800 / 150
      // = 18.67 (rounded to 2 decimals)
      expect(calculateAveragePrice(soilTypes)).toBe(18.67);
    });

    it('ignores soil types with zero quantity in weighted average', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 10,
          quantity_meters: 100,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 100, // High price but zero quantity
          quantity_meters: 0,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // Should only use first soil type
      // (10 * 100) / 100 = 10
      expect(calculateAveragePrice(soilTypes)).toBe(10);
    });

    it('handles mixed quantities (some with, some without)', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 10,
          quantity_meters: 100,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 20,
          quantity_meters: undefined,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // Since at least one has quantity, use weighted average
      // Only first one counts: (10 * 100) / 100 = 10
      expect(calculateAveragePrice(soilTypes)).toBe(10);
    });
  });

  describe('Decimal Precision', () => {
    it('rounds to 2 decimal places', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 10.333,
          quantity_meters: 100,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 20.666,
          quantity_meters: 100,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // (10.333 * 100 + 20.666 * 100) / 200
      // = 3099.9 / 200
      // = 15.4995
      // Rounded to 15.50
      expect(calculateAveragePrice(soilTypes)).toBe(15.50);
    });

    it('handles very small numbers', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 0.01,
          quantity_meters: 100,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 0.02,
          quantity_meters: 100,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // (0.01 * 100 + 0.02 * 100) / 200 = 0.015
      expect(calculateAveragePrice(soilTypes)).toBe(0.02); // Rounded
    });

    it('handles very large numbers', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy',
          price_per_meter: 999999.99,
          quantity_meters: 1000,
          notes: null,
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay',
          price_per_meter: 888888.88,
          quantity_meters: 1000,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ];

      // (999999.99 * 1000 + 888888.88 * 1000) / 2000
      // = 1888888870 / 2000
      // = 944444.435
      expect(calculateAveragePrice(soilTypes)).toBe(944444.44);
    });
  });

  describe('Real-World Scenarios', () => {
    it('calculates correctly for typical project with 3 soil types', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Sandy Soil',
          price_per_meter: 12.50,
          quantity_meters: 500,
          notes: 'Main area',
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Clay Soil',
          price_per_meter: 22.75,
          quantity_meters: 200,
          notes: 'Difficult section',
          created_at: '',
          updated_at: '',
        },
        {
          id: '3',
          project_id: 'test',
          soil_type_name: 'Rocky Terrain',
          price_per_meter: 35.00,
          quantity_meters: 100,
          notes: 'Mountain area',
          created_at: '',
          updated_at: '',
        },
      ];

      // (12.50 * 500 + 22.75 * 200 + 35.00 * 100) / (500 + 200 + 100)
      // = (6250 + 4550 + 3500) / 800
      // = 14300 / 800
      // = 17.875
      expect(calculateAveragePrice(soilTypes)).toBe(17.88);
    });

    it('handles project with only exploratory data (no quantities)', () => {
      const soilTypes: ProjectSoilType[] = [
        {
          id: '1',
          project_id: 'test',
          soil_type_name: 'Type A',
          price_per_meter: 15.00,
          quantity_meters: null,
          notes: 'Estimate only',
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          project_id: 'test',
          soil_type_name: 'Type B',
          price_per_meter: 20.00,
          quantity_meters: null,
          notes: 'Estimate only',
          created_at: '',
          updated_at: '',
        },
        {
          id: '3',
          project_id: 'test',
          soil_type_name: 'Type C',
          price_per_meter: 25.00,
          quantity_meters: null,
          notes: 'Estimate only',
          created_at: '',
          updated_at: '',
        },
      ];

      // Simple average: (15 + 20 + 25) / 3 = 20
      expect(calculateAveragePrice(soilTypes)).toBe(20);
    });
  });
});
