import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { ListQueryDto } from '@/common/pagination/list-query.dto.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';

export enum FilmSortField {
  Title = 'title',
  ReleaseDate = 'releaseDate',
  Status = 'status',
}

export class ListFilmsQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: FilmSortField, enumName: 'FilmSortField', description: 'По умолчанию сначала новые' })
  @IsOptional()
  @IsEnum(FilmSortField)
  sort?: FilmSortField;

  @ApiPropertyOptional({ enum: FilmStatus, enumName: 'FilmStatus', isArray: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsEnum(FilmStatus, { each: true })
  status?: FilmStatus[];
}
