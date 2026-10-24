import { ApiProperty } from '@nestjs/swagger';
import { CinemaSummaryDto, toCinemaSummary } from '@/modules/cinemas/dto/cinema.dto.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

export class StaffDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'admin' })
  login: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: StaffRole, enumName: 'StaffRole' })
  role: StaffRole;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  mustChangePassword: boolean;

  @ApiProperty({ type: [CinemaSummaryDto] })
  cinemas: CinemaSummaryDto[];
}

export const toStaffDto = ({ id, login, fullName, role, isBlocked, mustChangePassword, cinemas }: StaffUser): StaffDto => ({
  id,
  login,
  fullName,
  role,
  isBlocked,
  mustChangePassword,
  cinemas: cinemas.map(toCinemaSummary),
});
