import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

const TEST_DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/cinema_test';
const TEST_REDIS_URL = 'redis://localhost:6380/0';
const TEST_JWT_ACCESS_SECRET = 'test-access-secret-that-is-long-enough';
const TEST_MEDIA_DIR = join(tmpdir(), 'luch-test-media');

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
            REDIS_URL: process.env.TEST_REDIS_URL ?? TEST_REDIS_URL,
            JWT_ACCESS_SECRET: TEST_JWT_ACCESS_SECRET,
            COOKIE_SECURE: 'false',
            MEDIA_DIR: TEST_MEDIA_DIR,
          },
        },
      },
    ],
  },
});
