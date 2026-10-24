import { ApiProperty } from '@nestjs/swagger';
import { CreateHallDto } from '@/modules/halls/dto/create-hall.dto.js';
import { PriceZoneDto } from '@/modules/halls/dto/price-zone.dto.js';

export class HallDto extends CreateHallDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '1' })
  cinemaId: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: [PriceZoneDto] })
  priceZones: PriceZoneDto[];
}
