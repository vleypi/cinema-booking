import { ApiProperty } from '@nestjs/swagger';
import { CreatePriceZoneDto } from '@/modules/halls/dto/create-price-zone.dto.js';

export class PriceZoneDto extends CreatePriceZoneDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '1' })
  hallId: string;
}
