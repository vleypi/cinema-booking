import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';
import { IsCalendarDate } from '@/common/validation/is-calendar-date.decorator.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import {
  FILM_DESCRIPTION_MAX_LENGTH,
  FILM_DURATION_MAX_MINUTES,
  FILM_GENRE_MAX_LENGTH,
  FILM_TITLE_MAX_LENGTH,
  FILM_TRAILER_URL_MAX_LENGTH,
} from '@/modules/films/films.constant.js';

export class CreateFilmDto {
  @ApiProperty({ example: 'Мастер и Маргарита' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FILM_TITLE_MAX_LENGTH)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(FILM_DESCRIPTION_MAX_LENGTH)
  description: string;

  @ApiProperty({ example: 'Драма' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(FILM_GENRE_MAX_LENGTH)
  genre: string;

  @ApiProperty({ enum: AgeRating, enumName: 'AgeRating' })
  @IsEnum(AgeRating)
  ageRating: AgeRating;

  @ApiProperty({ example: 157 })
  @IsInt()
  @Min(1)
  @Max(FILM_DURATION_MAX_MINUTES)
  durationMinutes: number;

  @IsCalendarDate()
  releaseDate: string;

  @ApiProperty()
  @IsBoolean()
  isPremiere: boolean;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'https://www.youtube.com/watch?v=example' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(FILM_TRAILER_URL_MAX_LENGTH)
  trailerUrl?: string | null;

  @ApiProperty({ enum: FilmStatus, enumName: 'FilmStatus' })
  @IsEnum(FilmStatus)
  status: FilmStatus;
}
