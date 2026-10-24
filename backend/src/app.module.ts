import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter.js';
import { RedisModule } from '@/common/redis/redis.module.js';
import { createValidationException } from '@/common/validation/validation-errors.js';
import { EnvironmentVariables, validateEnvironment } from '@/config/environment.js';
import { createDatabaseOptions } from '@/database/database.options.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { HealthModule } from '@/modules/health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: (config) => validateEnvironment(config, EnvironmentVariables) }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        ...createDatabaseOptions({
          NODE_ENV: config.get('NODE_ENV', { infer: true }),
          DATABASE_URL: config.get('DATABASE_URL', { infer: true }),
        }),
        autoLoadEntities: true,
      }),
    }),
    RedisModule,
    AuthModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: createValidationException,
      }),
    },
  ],
})
export class AppModule {}
