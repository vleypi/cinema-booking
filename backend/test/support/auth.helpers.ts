import type { INestApplication } from '@nestjs/common';
import request, { type Response } from 'supertest';
import { API_PREFIX } from '@/app.setup.js';
import { AUTH_COOKIE_NAMES } from '@/modules/auth/auth.constant.js';
import type { IStaffCredentials } from '@test/support/staff.fixture.js';

export const AUTH_URL = `/${API_PREFIX}/auth`;

export type StaffAgent = ReturnType<typeof request.agent>;

export const loginAs = async (app: INestApplication, { login, password }: Pick<IStaffCredentials, 'login' | 'password'>): Promise<StaffAgent> => {
  const agent = request.agent(app.getHttpServer());
  await agent.post(`${AUTH_URL}/login`).send({ login, password }).expect(200);

  return agent;
};

export const readSetCookies = (response: Response): Record<string, string> => {
  const header = response.headers['set-cookie'] as unknown as string[] | undefined;

  return Object.fromEntries((header ?? []).map((cookie) => cookie.split(';')[0].split('=') as [string, string]));
};

export const refreshCookie = (token: string) => `${AUTH_COOKIE_NAMES.refresh}=${token}`;
