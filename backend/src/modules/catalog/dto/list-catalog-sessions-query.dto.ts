import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';
import { IsCalendarDate } from '@/common/validation/is-calendar-date.decorator.js';

export class ListCatalogSessionsQueryDto {
  @IsOptional()
  @IsCalendarDate()
  date?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  filmId?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  hallId?: string;
}
