import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateHallLayoutDto, SeatInputDto } from '@/modules/halls/dto/create-hall-layout.dto.js';

export class SeatDto extends SeatInputDto {
  @ApiProperty({ example: '1' })
  id: string;
}

export class HallLayoutDto extends OmitType(CreateHallLayoutDto, ['seats']) {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '1' })
  hallId: string;

  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty()
  isCurrent: boolean;

  @ApiProperty({ type: [SeatDto] })
  seats: SeatDto[];
}
