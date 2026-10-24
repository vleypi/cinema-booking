import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX } from '@/app.setup.js';

const SWAGGER_PATH = `${API_PREFIX}/docs`;
const SWAGGER_TITLE = 'ИС «Луч» API';
const SWAGGER_VERSION = '1.0';

export const setupSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder().setTitle(SWAGGER_TITLE).setVersion(SWAGGER_VERSION).build();

  SwaggerModule.setup(SWAGGER_PATH, app, () => SwaggerModule.createDocument(app, config));
};
