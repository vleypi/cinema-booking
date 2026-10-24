import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, IsNumberString, Max, Min, ValidateNested } from 'class-validator';
import { LAYOUT_ROWS_MAX, LAYOUT_SEATS_MAX, SEAT_NUMBER_MAX, SEAT_POSITION_MAX } from '@/modules/halls/halls.constant.js';
import { SeatType } from '@/modules/halls/seat-type.enum.js';

export class SeatInputDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(LAYOUT_ROWS_MAX)
  row: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(SEAT_NUMBER_MAX)
  number: number;

  @ApiProperty({ example: 0, description: 'Столбец на сетке схемы, проходы задаются пропусками' })
  @IsInt()
  @Min(0)
  @Max(SEAT_POSITION_MAX)
  posX: number;

  @ApiProperty({ example: 0, description: 'Строка на сетке схемы' })
  @IsInt()
  @Min(0)
  @Max(SEAT_POSITION_MAX)
  posY: number;

  @ApiProperty({ enum: SeatType, enumName: 'SeatType' })
  @IsEnum(SeatType)
  type: SeatType;

  @ApiProperty({ example: '1' })
  @IsNumberString({ no_symbols: true })
  priceZoneId: string;
}

export class CreateHallLayoutDto {
  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  @Max(LAYOUT_ROWS_MAX)
  rows: number;

  @ApiProperty({ type: [SeatInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(LAYOUT_SEATS_MAX)
  @ValidateNested({ each: true })
  @Type(() => SeatInputDto)
  seats: SeatInputDto[];
}
