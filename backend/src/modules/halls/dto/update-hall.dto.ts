import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { IsOptionalNonNull, StrictPartialType } from '@/common/validation/strict-partial.js';
import { CreateHallDto } from '@/modules/halls/dto/create-hall.dto.js';

export class UpdateHallDto extends StrictPartialType(CreateHallDto) {
  @ApiPropertyOptional()
  @IsOptionalNonNull()
  @IsBoolean()
  isActive?: boolean;
}
