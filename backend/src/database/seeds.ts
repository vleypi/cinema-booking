import type { EntityManager } from 'typeorm';

export type Seed = (manager: EntityManager) => Promise<void>;

export const SEEDS: Seed[] = [];
