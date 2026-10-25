import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListQueryDto } from '@/common/pagination/list-query.dto.js';

export enum CinemaSortField {
  Name = 'name',
  Timezone = 'timezone',
}

export class ListCinemasQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: CinemaSortField, enumName: 'CinemaSortField', default: CinemaSortField.Name })
  @IsOptional()
  @IsEnum(CinemaSortField)
  sort?: CinemaSortField;
}
