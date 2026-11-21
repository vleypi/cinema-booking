import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListQueryDto } from '@/common/pagination/list-query.dto.js';
import { IsQueryBoolean } from '@/common/validation/is-query-boolean.decorator.js';

export enum CinemaSortField {
  Name = 'name',
  Timezone = 'timezone',
}

export class ListCinemasQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: CinemaSortField, enumName: 'CinemaSortField', default: CinemaSortField.Name })
  @IsOptional()
  @IsEnum(CinemaSortField)
  sort?: CinemaSortField;

  @ApiPropertyOptional({ description: 'Только опубликованные или только скрытые' })
  @IsOptional()
  @IsQueryBoolean()
  isPublished?: boolean;
}
