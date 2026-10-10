import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Migrates the test database once before the run.
    globalSetup: ['./test/global-setup.ts'],
    // The database tests share one database, so run test files one after another.
    fileParallelism: false,
    env: { NODE_ENV: 'test' },
  },
});
