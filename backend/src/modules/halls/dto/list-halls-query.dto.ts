import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SearchQueryDto } from '@/common/pagination/list-query.dto.js';
import { IsQueryBoolean } from '@/common/validation/is-query-boolean.decorator.js';

export enum HallSortField {
  Name = 'name',
  BasePrice = 'basePrice',
}

export class ListHallsQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ enum: HallSortField, enumName: 'HallSortField', default: HallSortField.Name })
  @IsOptional()
  @IsEnum(HallSortField)
  sort?: HallSortField;

  @ApiPropertyOptional({ description: 'Только работающие или только неработающие' })
  @IsOptional()
  @IsQueryBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Цена по временным интервалам или фиксированная' })
  @IsOptional()
  @IsQueryBoolean()
  useTimeBands?: boolean;
}
