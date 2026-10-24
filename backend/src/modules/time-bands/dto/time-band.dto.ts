import { ApiProperty } from '@nestjs/swagger';
import { TimeBandInputDto } from '@/modules/time-bands/dto/replace-time-bands.dto.js';

export class TimeBandDto extends TimeBandInputDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '1' })
  cinemaId: string;

  @ApiProperty({ example: '12:00' })
  endsAt: string;
}
