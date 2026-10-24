import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { hashPassword } from '@/common/security/password.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

export const STAFF_PASSWORD = 'Correct-Password-1';

interface IStaffOptions {
  role?: StaffRole;
  cinemaIds?: string[];
  isBlocked?: boolean;
  mustChangePassword?: boolean;
}

export interface IStaffCredentials {
  id: string;
  login: string;
  password: string;
}

let sequence = 0;
const nextSuffix = () => `${Date.now()}-${++sequence}`;

export const createCinema = async (app: INestApplication): Promise<string> => {
  const suffix = nextSuffix();
  const cinema = await app.get(DataSource).getRepository(Cinema).save({
    name: `Кинотеатр ${suffix}`,
    slug: `cinema-${suffix}`,
    address: 'Москва',
    opensAt: '10:00',
    closesAt: '02:00',
  });

  return cinema.id;
};

export const createStaff = async (
  app: INestApplication,
  { role = StaffRole.Admin, cinemaIds = [], isBlocked = false, mustChangePassword = false }: IStaffOptions = {},
): Promise<IStaffCredentials> => {
  const login = `staff-${nextSuffix()}`;
  const staff = await app.get(DataSource).getRepository(StaffUser).save({
    login,
    fullName: 'Тестовый сотрудник',
    role,
    isBlocked,
    mustChangePassword,
    passwordHash: await hashPassword(STAFF_PASSWORD),
    cinemas: cinemaIds.map((id) => ({ id }) as Cinema),
  });

  return { id: staff.id, login, password: STAFF_PASSWORD };
};
