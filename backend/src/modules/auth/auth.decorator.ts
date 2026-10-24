import { applyDecorators, createParamDecorator, type ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { REQUIRED_PERMISSIONS, AUTH_COOKIE_NAMES } from '@/modules/auth/auth.constant.js';
import type { Permission } from '@/modules/auth/permissions.js';
import { type IAuthRequest, AuthGuard } from '@/modules/auth/auth.guard.js';

export const Auth = (...permissions: Permission[]) =>
  applyDecorators(
    SetMetadata(REQUIRED_PERMISSIONS, permissions),
    UseGuards(AuthGuard),
    ApiCookieAuth(AUTH_COOKIE_NAMES.access),
    ApiUnauthorizedResponse(),
    ApiForbiddenResponse(),
  );

export const CurrentStaff = createParamDecorator((_: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<IAuthRequest>().staff);
