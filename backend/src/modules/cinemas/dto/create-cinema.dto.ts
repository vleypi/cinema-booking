import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsString, IsTimeZone, Matches, Max, MaxLength, Min } from 'class-validator';
import { IsTimeOfDay } from '@/common/validation/is-time-of-day.decorator.js';
import {
  CINEMA_ADDRESS_MAX_LENGTH,
  CINEMA_MESSAGES,
  CINEMA_NAME_MAX_LENGTH,
  CINEMA_SLUG_MAX_LENGTH,
  CINEMA_SLUG_PATTERN,
  CLEANING_BREAK_MAX_MINUTES,
} from '@/modules/cinemas/cinemas.constant.js';

export class CreateCinemaDto {
  @ApiProperty({ example: 'Луч' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(CINEMA_NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({ example: 'luch', pattern: CINEMA_SLUG_PATTERN.source })
  @IsString()
  @Matches(CINEMA_SLUG_PATTERN, { message: CINEMA_MESSAGES.slugFormat })
  @MaxLength(CINEMA_SLUG_MAX_LENGTH)
  slug: string;

  @ApiProperty({ example: 'Москва, ул. Ленина, 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(CINEMA_ADDRESS_MAX_LENGTH)
  address: string;

  @ApiProperty({ example: 'Europe/Moscow' })
  @IsTimeZone()
  timezone: string;

  @IsTimeOfDay()
  opensAt: string;

  @IsTimeOfDay()
  closesAt: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(0)
  @Max(CLEANING_BREAK_MAX_MINUTES)
  cleaningBreakMinutes: number;

  @ApiProperty()
  @IsBoolean()
  isPublished: boolean;
}
