import { ApiProperty } from '@nestjs/swagger';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { Permission } from '@/modules/auth/permissions.js';

export class StaffCinemaDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Луч' })
  name: string;

  @ApiProperty({ example: 'luch' })
  slug: string;
}

export class StaffProfileDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'admin' })
  login: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: StaffRole, enumName: 'StaffRole' })
  role: StaffRole;

  @ApiProperty()
  mustChangePassword: boolean;

  @ApiProperty({ enum: Permission, enumName: 'Permission', isArray: true })
  permissions: Permission[];

  @ApiProperty({ type: [StaffCinemaDto] })
  cinemas: StaffCinemaDto[];
}

export class SessionDto {
  @ApiProperty({ example: true })
  authenticated: true;
}
