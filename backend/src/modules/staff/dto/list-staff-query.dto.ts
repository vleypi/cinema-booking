import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListQueryDto } from '@/common/pagination/list-query.dto.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

export enum StaffSortField {
  FullName = 'fullName',
  Role = 'role',
  Status = 'status',
}

export enum StaffStatusFilter {
  Active = 'active',
  TemporaryPassword = 'temporaryPassword',
  Blocked = 'blocked',
}

export class ListStaffQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: StaffSortField, enumName: 'StaffSortField', default: StaffSortField.FullName })
  @IsOptional()
  @IsEnum(StaffSortField)
  sort?: StaffSortField;

  @ApiPropertyOptional({ enum: StaffRole, enumName: 'StaffRole' })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiPropertyOptional({ enum: StaffStatusFilter, enumName: 'StaffStatusFilter' })
  @IsOptional()
  @IsEnum(StaffStatusFilter)
  status?: StaffStatusFilter;
}
