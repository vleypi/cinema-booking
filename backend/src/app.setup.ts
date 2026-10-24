import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

export const API_PREFIX = 'api';

export const configureApp = (app: INestApplication): INestApplication => app.setGlobalPrefix(API_PREFIX).use(cookieParser());
