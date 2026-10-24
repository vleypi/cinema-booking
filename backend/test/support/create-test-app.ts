import type { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module.js';
import { configureApp } from '@/app.setup.js';

export const createTestApp = async (controllers: Type[] = []): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule], controllers }).compile();
  const app = configureApp(moduleRef.createNestApplication());

  await app.init();
  return app;
};
