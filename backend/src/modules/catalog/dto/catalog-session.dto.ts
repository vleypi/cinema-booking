import { ApiProperty, PickType } from '@nestjs/swagger';
import { HallDto } from '@/modules/halls/dto/hall.dto.js';
import { SessionDto } from '@/modules/sessions/dto/session.dto.js';

export class CatalogHallDto extends PickType(HallDto, ['id', 'name', 'format']) {}

export class CatalogSessionDto extends PickType(SessionDto, ['id', 'filmId', 'hallId', 'startsAt', 'endsAt', 'format', 'film']) {
  @ApiProperty({ type: CatalogHallDto })
  hall: CatalogHallDto;

  @ApiProperty({ example: 33000, description: 'Цена самого дешевого места в копейках' })
  minPrice: number;
}
