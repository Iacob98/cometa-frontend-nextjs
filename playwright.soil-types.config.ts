import { defineConfig, devices } from '@playwright/test';

/**
 * Simplified Playwright config for Soil Types E2E tests only
 * No global setup dependencies
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/soil-types.spec.ts',

  fullyParallel: false, // Sequential for now
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for faster feedback
  workers: 1, // Single worker for sequential tests

  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Web server - ensure Next.js is running */
  webServer: {
    command: 'lsof -ti:3000 > /dev/null || npm run dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
});
