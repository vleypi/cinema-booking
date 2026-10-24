import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumberString, IsOptional, Max, Min } from 'class-validator';
import { IsCalendarDate } from '@/common/validation/is-calendar-date.decorator.js';
import { IsTimeOfDay } from '@/common/validation/is-time-of-day.decorator.js';
import { HALL_BASE_PRICE_MAX } from '@/modules/halls/halls.constant.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';

export class CreateSessionDto {
  @ApiProperty({ example: '1' })
  @IsNumberString({ no_symbols: true })
  filmId: string;

  @ApiProperty({ example: '1' })
  @IsNumberString({ no_symbols: true })
  hallId: string;

  @IsCalendarDate()
  date: string;

  @IsTimeOfDay()
  time: string;

  @ApiProperty({ enum: SessionFormat, enumName: 'SessionFormat' })
  @IsEnum(SessionFormat)
  format: SessionFormat;

  @ApiPropertyOptional({ example: 60000, description: 'Базовая цена сеанса в копейках, по умолчанию берется цена зала' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(HALL_BASE_PRICE_MAX)
  basePriceOverride?: number;
}
