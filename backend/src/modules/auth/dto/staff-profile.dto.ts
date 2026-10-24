import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Permission } from '@/modules/auth/permissions.js';
import { StaffDto } from '@/modules/staff/dto/staff.dto.js';

export class StaffProfileDto extends OmitType(StaffDto, ['isBlocked']) {
  @ApiProperty({ enum: Permission, enumName: 'Permission', isArray: true })
  permissions: Permission[];
}

export class SessionDto {
  @ApiProperty({ example: true })
  authenticated: true;
}
