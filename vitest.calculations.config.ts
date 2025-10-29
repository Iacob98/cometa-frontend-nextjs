/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

// Minimal config for pure function tests without MSW/DOM dependencies
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // No setupFiles - avoid MSW initialization
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
