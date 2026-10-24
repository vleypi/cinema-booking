import { fileURLToPath } from 'node:url';
import type { DataSourceOptions } from 'typeorm';
import { type DatabaseEnvironment, NodeEnvironment } from '@/config/environment.js';

const resolveFromSource = (pattern: string) => fileURLToPath(new URL(pattern, import.meta.url));

export const createDatabaseOptions = ({ NODE_ENV, DATABASE_URL }: DatabaseEnvironment): DataSourceOptions => {
  const isTest = NODE_ENV === NodeEnvironment.Test;

  return {
    type: 'postgres',
    url: DATABASE_URL,
    entities: [resolveFromSource('../**/*.entity.js')],
    migrations: [resolveFromSource('./migrations/*.js')],
    migrationsRun: !isTest,
    synchronize: isTest,
    dropSchema: isTest,
  };
};
