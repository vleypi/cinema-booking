import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
import { IsMultiplier } from '@/common/validation/is-multiplier.decorator.js';
import { IsTimeOfDay } from '@/common/validation/is-time-of-day.decorator.js';
import { TIME_BAND_MESSAGES, TIME_BAND_NAME_MAX_LENGTH, TIME_BANDS_MAX } from '@/modules/time-bands/time-bands.constant.js';

export class TimeBandInputDto {
  @ApiProperty({ example: 'Утро' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(TIME_BAND_NAME_MAX_LENGTH)
  name: string;

  @IsTimeOfDay()
  startsAt: string;

  @IsMultiplier()
  multiplier: number;
}

export class ReplaceTimeBandsDto {
  @ApiProperty({ type: [TimeBandInputDto], description: 'Интервал длится до начала следующего, последний до конца суток' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(TIME_BANDS_MAX)
  @ArrayUnique((band: TimeBandInputDto) => band.startsAt, { message: TIME_BAND_MESSAGES.duplicateStart })
  @ValidateNested({ each: true })
  @Type(() => TimeBandInputDto)
  bands: TimeBandInputDto[];
}
