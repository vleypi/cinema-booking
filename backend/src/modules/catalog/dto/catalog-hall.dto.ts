import { ApiProperty, PickType } from '@nestjs/swagger';
import { SeatInputDto } from '@/modules/halls/dto/create-hall-layout.dto.js';
import { HallDto } from '@/modules/halls/dto/hall.dto.js';
import { PriceZoneDto } from '@/modules/halls/dto/price-zone.dto.js';
import { TimeBandDto } from '@/modules/time-bands/dto/time-band.dto.js';

export class CatalogPriceZoneDto extends PickType(PriceZoneDto, ['id', 'name', 'multiplier']) {
  @ApiProperty({ type: [Number], example: [33000, 40000, 48000], description: 'Цена места в копейках для каждого временного интервала по порядку' })
  prices: number[];
}

export class CatalogHallDetailsDto extends PickType(HallDto, ['id', 'name', 'format']) {
  @ApiProperty({ type: [SeatInputDto], description: 'Места текущей версии схемы' })
  seats: SeatInputDto[];

  @ApiProperty({ type: [CatalogPriceZoneDto], description: 'Ценовые зоны, у которых есть места на схеме' })
  priceZones: CatalogPriceZoneDto[];
}

export class CatalogTimeBandDto extends PickType(TimeBandDto, ['name', 'startsAt', 'endsAt']) {}

export class CatalogHallsDto {
  @ApiProperty({ type: [CatalogTimeBandDto] })
  timeBands: CatalogTimeBandDto[];

  @ApiProperty({ type: [CatalogHallDetailsDto] })
  halls: CatalogHallDetailsDto[];
}
