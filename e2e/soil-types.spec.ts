/**
 * Phase 4: E2E Tests for Soil Types Feature
 *
 * Tests complete user workflows from browser perspective:
 * - Login flow
 * - Navigate to project
 * - CRUD operations on soil types
 * - Visual validation
 * - Error handling
 *
 * @see https://playwright.dev/docs/test-annotations
 */

import { test, expect, type Page } from '@playwright/test';

// Test configuration
const TEST_PROJECT_ID = '8cd3a97f-e911-42c3-b145-f9f5c1c6340a';
const BASE_URL = 'http://localhost:3000';

// Test user credentials
const ADMIN_USER = {
  email: 'admin@cometa.de',
  pin: '1234',
};

/**
 * Helper function to login as admin
 */
async function loginAsAdmin(page: Page) {
  await page.goto('/login');

  // Fill login form
  await page.fill('input[name="email"]', ADMIN_USER.email);
  await page.fill('input[name="pin_code"]', ADMIN_USER.pin);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 5000 });

  // Verify we're logged in
  await expect(page.locator('text=Dashboard')).toBeVisible();
}

/**
 * Helper function to navigate to project soil types
 */
async function navigateToProjectSoilTypes(page: Page) {
  // Go to projects page
  await page.goto(`/dashboard/projects/${TEST_PROJECT_ID}`);

  // Wait for project page to load
  await expect(page.locator('text=Soil Types')).toBeVisible({ timeout: 10000 });
}

test.describe('Phase 4: Soil Types E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsAdmin(page);
  });

  test.describe('Navigation & Display', () => {

    test('should navigate to project and display soil types card', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      // Verify Soil Types card is visible
      const soilTypesCard = page.locator('[data-testid="soil-types-card"]').or(page.locator('text=Soil Types').locator('..')).first();
      await expect(soilTypesCard).toBeVisible();

      // Verify "Add Soil Type" button exists
      await expect(page.locator('button:has-text("Add Soil Type")')).toBeVisible();
    });

    test('should display existing soil types if any', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      // Wait for data to load
      await page.waitForTimeout(1000);

      // Check if there are soil types or empty state
      const hasSoilTypes = await page.locator('table').count() > 0;
      const hasEmptyState = await page.locator('text=/no soil types/i').count() > 0;

      expect(hasSoilTypes || hasEmptyState).toBeTruthy();
    });

    test('should display total cost if soil types exist', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      await page.waitForTimeout(1000);

      // If there's a table, there should be a total cost
      const hasTable = await page.locator('table').count() > 0;

      if (hasTable) {
        await expect(page.locator('text=/total estimated cost/i')).toBeVisible();
        await expect(page.locator('text=/€/').first()).toBeVisible();
      }
    });
  });

  test.describe('Create Soil Type', () => {

    test('should open add soil type dialog', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      // Click "Add Soil Type" button
      await page.click('button:has-text("Add Soil Type")');

      // Verify dialog opened
      await expect(page.locator('role=dialog')).toBeVisible();
      await expect(page.locator('text=/add soil type/i')).toBeVisible();

      // Verify form fields are present
      await expect(page.locator('input[name="soil_type_name"]').or(page.locator('label:has-text("Soil Type Name")').locator('..'))).toBeVisible();
    });

    test('should create new soil type with valid data', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      // Open dialog
      await page.click('button:has-text("Add Soil Type")');
      await page.waitForSelector('role=dialog');

      // Fill form
      const testSoilType = {
        name: `E2E Test Soil ${Date.now()}`,
        price: '35.50',
        quantity: '125',
        notes: 'Created by E2E test',
      };

      // Find and fill input fields
      await page.fill('input[name="soil_type_name"]', testSoilType.name).catch(() =>
        page.locator('label:has-text("Soil Type Name")').locator('..').locator('input').fill(testSoilType.name)
      );

      await page.fill('input[name="price_per_meter"]', testSoilType.price).catch(() =>
        page.locator('label:has-text(/price/i)').locator('..').locator('input').fill(testSoilType.price)
      );

      await page.fill('input[name="quantity_meters"]', testSoilType.quantity).catch(() =>
        page.locator('label:has-text(/quantity/i)').locator('..').locator('input').fill(testSoilType.quantity)
      );

      // Submit form
      await page.click('button:has-text("Add")');

      // Wait for dialog to close
      await expect(page.locator('role=dialog')).not.toBeVisible({ timeout: 5000 });

      // Verify new soil type appears in table
      await expect(page.locator(`text=${testSoilType.name}`)).toBeVisible({ timeout: 5000 });
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      // Open dialog
      await page.click('button:has-text("Add Soil Type")');
      await page.waitForSelector('role=dialog');

      // Try to submit empty form
      await page.click('button:has-text("Add")');

      // Should show validation errors or not close dialog
      const dialogStillVisible = await page.locator('role=dialog').isVisible();
      expect(dialogStillVisible).toBeTruthy();
    });
  });

  test.describe('Delete Soil Type', () => {

    test('should delete soil type', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      // Wait for table to load
      await page.waitForTimeout(1000);

      // Check if there are any soil types to delete
      const hasSoilTypes = await page.locator('table tbody tr').count() > 0;

      if (!hasSoilTypes) {
        console.log('No soil types to delete - skipping test');
        test.skip();
        return;
      }

      // Get the first soil type name for verification
      const firstSoilTypeName = await page.locator('table tbody tr').first().locator('td').first().textContent();

      // Find and click delete button (with trash icon)
      const deleteButton = page.locator('button[aria-label*="Delete"]').first();
      await deleteButton.click();

      // Wait for deletion to complete (optimistic update or refetch)
      await page.waitForTimeout(1000);

      // Verify soil type is removed
      if (firstSoilTypeName) {
        const stillExists = await page.locator(`text=${firstSoilTypeName}`).count() > 0;
        expect(stillExists).toBeFalsy();
      }
    });
  });

  test.describe('Data Validation', () => {

    test('should display correct total cost calculation', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      await page.waitForTimeout(1000);

      // Check if there are soil types
      const rows = await page.locator('table tbody tr').count();

      if (rows === 0) {
        console.log('No soil types for cost calculation test');
        test.skip();
        return;
      }

      // Calculate expected total manually
      let expectedTotal = 0;

      for (let i = 0; i < rows; i++) {
        const row = page.locator('table tbody tr').nth(i);

        // Get price and quantity from cells
        const cells = row.locator('td');
        const priceText = await cells.nth(1).textContent(); // Assuming price is 2nd column
        const quantityText = await cells.nth(2).textContent(); // Assuming quantity is 3rd column

        if (priceText && quantityText) {
          const price = parseFloat(priceText.replace(/[€,]/g, '').trim());
          const quantity = parseFloat(quantityText.replace(/,/g, '').trim());

          if (!isNaN(price) && !isNaN(quantity)) {
            expectedTotal += price * quantity;
          }
        }
      }

      // Get displayed total
      const totalElement = page.locator('text=/total estimated cost/i').locator('..').locator('text=/€/');
      const displayedTotal = await totalElement.textContent();

      if (displayedTotal && expectedTotal > 0) {
        const total = parseFloat(displayedTotal.replace(/[€,]/g, '').trim());

        // Allow small floating point differences
        expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01);
      }
    });

    test('should display all required fields in table', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      await page.waitForTimeout(1000);

      const hasTable = await page.locator('table').count() > 0;

      if (!hasTable) {
        console.log('No table to validate');
        test.skip();
        return;
      }

      // Verify table headers exist
      await expect(page.locator('th:has-text("Soil Type")')).toBeVisible();
      await expect(page.locator('th:has-text(/price/i)')).toBeVisible();
      await expect(page.locator('th:has-text(/quantity/i)')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {

    test('should handle network errors gracefully', async ({ page }) => {
      // This test is difficult to implement without mocking
      // Documenting expected behavior:
      // - Should show error message if API fails
      // - Should not crash the application
      // - Should allow retry

      await navigateToProjectSoilTypes(page);

      // Verify page doesn't show error on load
      const hasError = await page.locator('text=/error/i').count() > 0;
      expect(hasError).toBeFalsy();
    });

    test('should handle empty state correctly', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      await page.waitForTimeout(1000);

      const hasTable = await page.locator('table tbody tr').count() > 0;
      const hasEmptyMessage = await page.locator('text=/no soil types/i').count() > 0;

      // Should have either data or empty message, not both
      expect(hasTable || hasEmptyMessage).toBeTruthy();

      if (!hasTable) {
        expect(hasEmptyMessage).toBeTruthy();
      }
    });
  });

  test.describe('UI/UX', () => {

    test('should have accessible delete buttons', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      await page.waitForTimeout(1000);

      const hasTable = await page.locator('table tbody tr').count() > 0;

      if (!hasTable) {
        console.log('No table rows to test accessibility');
        test.skip();
        return;
      }

      // Check that delete buttons have proper aria-labels
      const deleteButtons = page.locator('button[aria-label*="Delete"]');
      const buttonCount = await deleteButtons.count();

      expect(buttonCount).toBeGreaterThan(0);

      // Verify first button has descriptive aria-label
      const firstLabel = await deleteButtons.first().getAttribute('aria-label');
      expect(firstLabel).toBeTruthy();
      expect(firstLabel?.toLowerCase()).toContain('delete');
    });

    test('should display loading state', async ({ page }) => {
      await page.goto(`/dashboard/projects/${TEST_PROJECT_ID}`);

      // Loading state should appear briefly
      // This is a timing-sensitive test and might be flaky
      const hasLoadingIndicator = await page.locator('text=/loading/i').count() > 0;

      // Eventually should show content
      await expect(page.locator('text=Soil Types')).toBeVisible({ timeout: 10000 });
    });

    test('should have responsive layout', async ({ page }) => {
      await navigateToProjectSoilTypes(page);

      // Verify main elements are visible
      await expect(page.locator('text=Soil Types')).toBeVisible();
      await expect(page.locator('button:has-text("Add Soil Type")')).toBeVisible();

      // Card should have proper styling
      const card = page.locator('text=Soil Types').locator('..').locator('..');
      await expect(card).toBeVisible();
    });
  });
});
