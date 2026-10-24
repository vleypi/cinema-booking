import { Controller, Get, type Type } from '@nestjs/common';
import { Permission } from '@/modules/auth/permissions.js';
import { Auth } from '@/modules/auth/auth.decorator.js';

export const PERMISSION_PROBE_PATH = 'permission-probe';
export const CINEMA_PROBE_PATH = 'cinema-probe';

const createPermissionProbe = (permission: Permission): Type => {
  @Controller(`${PERMISSION_PROBE_PATH}/${permission}`)
  class PermissionProbeController {
    @Get()
    @Auth(permission)
    check() {
      return { permission };
    }
  }

  return PermissionProbeController;
};

@Controller(`${CINEMA_PROBE_PATH}/:cinemaId`)
class CinemaProbeController {
  @Get()
  @Auth()
  check() {
    return { allowed: true };
  }
}

export const ACCESS_PROBE_CONTROLLERS: Type[] = [...Object.values(Permission).map(createPermissionProbe), CinemaProbeController];
