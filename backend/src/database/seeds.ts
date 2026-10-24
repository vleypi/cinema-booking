import type { EntityManager } from 'typeorm';
import { seedSuperAdmin } from '@/modules/staff/staff.seed.js';

export type Seed = (manager: EntityManager) => Promise<void>;

export const SEEDS: Seed[] = [seedSuperAdmin];
