import { hashPassword } from '@/common/security/password.js';
import type { Seed } from '@/database/seeds.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

export const seedSuperAdmin: Seed = async (manager) => {
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!password) throw new Error('Укажите SEED_SUPER_ADMIN_PASSWORD для создания суперадминистратора');

  const repository = manager.getRepository(StaffUser);
  if (await repository.existsBy({ login: 'admin' })) return;

  await repository.insert({
    login: 'admin',
    fullName: 'Суперадминистратор',
    role: StaffRole.SuperAdmin,
    passwordHash: await hashPassword(password),
    mustChangePassword: false,
  });
};
