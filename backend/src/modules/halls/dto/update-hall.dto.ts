import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateHallDto } from '@/modules/halls/dto/create-hall.dto.js';

export class UpdateHallDto extends PartialType(CreateHallDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
