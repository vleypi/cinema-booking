import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { EnvironmentVariables } from '@/config/environment.js';
import { ACCESS_TOKEN_TTL_SECONDS } from '@/modules/auth/auth.constant.js';
import { AuthController } from '@/modules/auth/auth.controller.js';
import { AuthService } from '@/modules/auth/auth.service.js';
import { RefreshToken } from '@/modules/auth/entities/refresh-token.entity.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([StaffUser, RefreshToken, Cinema]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
