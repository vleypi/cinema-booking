import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateCinemaDto } from '@/modules/cinemas/dto/create-cinema.dto.js';
import type { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';

export class CinemaDto extends CreateCinemaDto {
  @ApiProperty({ example: '1' })
  id: string;
}

export class CinemaSummaryDto extends PickType(CinemaDto, ['id', 'name', 'slug', 'timezone']) {}

export const toCinemaSummary = ({ id, name, slug, timezone }: Cinema): CinemaSummaryDto => ({ id, name, slug, timezone });
