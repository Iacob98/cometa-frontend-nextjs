import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    name: 'performance',
    environment: 'node',
    include: ['src/__tests__/performance/**/*.perf.test.{ts,tsx}'],
    // Exclude MSW setup for performance tests
    setupFiles: [],
    testTimeout: 60000,
    hookTimeout: 30000,
  },
});
