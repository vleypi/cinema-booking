import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateStaffDto } from '@/modules/staff/dto/create-staff.dto.js';

export class UpdateStaffDto extends PartialType(OmitType(CreateStaffDto, ['login'])) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}
