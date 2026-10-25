import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListQueryDto } from '@/common/pagination/list-query.dto.js';

export enum StaffSortField {
  FullName = 'fullName',
  Role = 'role',
  Status = 'status',
}

export class ListStaffQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: StaffSortField, enumName: 'StaffSortField', default: StaffSortField.FullName })
  @IsOptional()
  @IsEnum(StaffSortField)
  sort?: StaffSortField;
}
