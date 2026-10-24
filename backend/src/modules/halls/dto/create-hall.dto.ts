import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';
import { HALL_BASE_PRICE_MAX, HALL_FORMAT_MAX_LENGTH, HALL_NAME_MAX_LENGTH } from '@/modules/halls/halls.constant.js';

export class CreateHallDto {
  @ApiProperty({ example: 'Зал 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(HALL_NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({ example: 'Лазер 4K' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(HALL_FORMAT_MAX_LENGTH)
  format: string;

  @ApiProperty({ example: 40000, description: 'Базовая цена места в копейках' })
  @IsInt()
  @Min(0)
  @Max(HALL_BASE_PRICE_MAX)
  basePrice: number;

  @ApiProperty()
  @IsBoolean()
  useTimeBands: boolean;
}
