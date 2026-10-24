import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AUTH_MESSAGES, REQUIRED_PERMISSIONS, AUTH_COOKIE_NAMES } from '@/modules/auth/auth.constant.js';
import { AuthService } from '@/modules/auth/auth.service.js';
import { canAccessCinema, type Permission, ROLE_PERMISSIONS } from '@/modules/auth/permissions.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

export interface IAuthRequest extends Request {
  staff: StaffUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IAuthRequest>();
    const staff = await this.auth.findStaffByAccessToken(request.cookies?.[AUTH_COOKIE_NAMES.access]);
    const permissions = this.reflector.getAllAndOverride<Permission[]>(REQUIRED_PERMISSIONS, [context.getHandler(), context.getClass()]) ?? [];
    const cinemaId = request.params.cinemaId;

    if (permissions.length > 0 && staff.mustChangePassword) throw new ForbiddenException(AUTH_MESSAGES.passwordChangeRequired);
    if (!permissions.every((permission) => ROLE_PERMISSIONS[staff.role].includes(permission))) {
      throw new ForbiddenException(AUTH_MESSAGES.permissionDenied);
    }
    if (typeof cinemaId === 'string' && !canAccessCinema(staff, cinemaId)) throw new ForbiddenException(AUTH_MESSAGES.cinemaAccessDenied);

    request.staff = staff;
    return true;
  }
}
