import { defineConfig } from 'vitest/config';

const TEST_DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/cinema_test';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    projects: [
      { extends: true, test: { name: 'unit', include: ['src/**/*.spec.ts'] } },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['test/**/*.e2e-spec.ts'],
          fileParallelism: false,
          env: {
            NODE_ENV: 'test',
            DATABASE_URL: process.env.TEST_DATABASE_URL ?? TEST_DATABASE_URL,
          },
        },
      },
    ],
  },
});
