import dataSource from './data-source.js';
import { SEEDS } from './seeds.js';

await dataSource.initialize();

try {
  await dataSource.transaction(async (manager) => {
    for (const seed of SEEDS) await seed(manager);
  });
} finally {
  await dataSource.destroy();
}
