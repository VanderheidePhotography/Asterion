import { defineConfig } from 'vitest/config';

// Domain and data tests are pure TypeScript — no DOM, no React plugin needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
