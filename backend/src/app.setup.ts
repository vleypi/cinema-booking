import type { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'api';

export const configureApp = (app: INestApplication): INestApplication => app.setGlobalPrefix(API_PREFIX);
