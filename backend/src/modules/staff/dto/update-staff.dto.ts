import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { IsOptionalNonNull, StrictPartialType } from '@/common/validation/strict-partial.js';
import { CreateStaffDto } from '@/modules/staff/dto/create-staff.dto.js';

export class UpdateStaffDto extends StrictPartialType(OmitType(CreateStaffDto, ['login'])) {
  @ApiPropertyOptional()
  @IsOptionalNonNull()
  @IsBoolean()
  isBlocked?: boolean;
}
