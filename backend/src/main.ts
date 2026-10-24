import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module.js';
import { configureApp } from '@/app.setup.js';
import { setupSwagger } from '@/common/swagger/setup-swagger.js';
import type { EnvironmentVariables } from '@/config/environment.js';

const app = configureApp(await NestFactory.create(AppModule));
setupSwagger(app);

await app.listen(app.get<ConfigService<EnvironmentVariables, true>>(ConfigService).get('PORT', { infer: true }));
