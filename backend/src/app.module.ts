import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter.js';
import { MailModule } from '@/common/mail/mail.module.js';
import { RedisModule } from '@/common/redis/redis.module.js';
import { createValidationException } from '@/common/validation/validation-errors.js';
import { EnvironmentVariables, validateEnvironment } from '@/config/environment.js';
import { createDatabaseOptions } from '@/database/database.options.js';
import { AuthModule } from '@/modules/auth/auth.module.js';
import { BoxOfficeModule } from '@/modules/box-office/box-office.module.js';
import { CatalogModule } from '@/modules/catalog/catalog.module.js';
import { CinemasModule } from '@/modules/cinemas/cinemas.module.js';
import { CustomersModule } from '@/modules/customers/customers.module.js';
import { FilmsModule } from '@/modules/films/films.module.js';
import { HallsModule } from '@/modules/halls/halls.module.js';
import { HealthModule } from '@/modules/health/health.module.js';
import { MediaModule } from '@/modules/media/media.module.js';
import { OrdersModule } from '@/modules/orders/orders.module.js';
import { PaymentsModule } from '@/modules/payments/payments.module.js';
import { SessionsModule } from '@/modules/sessions/sessions.module.js';
import { StaffModule } from '@/modules/staff/staff.module.js';
import { TicketsModule } from '@/modules/tickets/tickets.module.js';
import { TimeBandsModule } from '@/modules/time-bands/time-bands.module.js';

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
    MailModule,
    AuthModule,
    CinemasModule,
    StaffModule,
    HallsModule,
    TimeBandsModule,
    MediaModule,
    FilmsModule,
    SessionsModule,
    CatalogModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    TicketsModule,
    BoxOfficeModule,
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
