import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsMultiplier } from '@/common/validation/is-multiplier.decorator.js';
import { PRICE_ZONE_NAME_MAX_LENGTH } from '@/modules/halls/halls.constant.js';

export class CreatePriceZoneDto {
  @ApiProperty({ example: 'Лучшие места' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PRICE_ZONE_NAME_MAX_LENGTH)
  name: string;

  @IsMultiplier()
  multiplier: number;
}
