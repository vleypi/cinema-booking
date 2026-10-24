import { ApiProperty } from '@nestjs/swagger';
import { FilmDto } from '@/modules/films/dto/film.dto.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';

export class SessionDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '1' })
  filmId: string;

  @ApiProperty({ example: '1' })
  hallId: string;

  @ApiProperty({ example: '1', description: 'Версия схемы зала на момент создания сеанса' })
  layoutId: string;

  @ApiProperty({ description: 'Начало в UTC, показывается в часовом поясе кинотеатра' })
  startsAt: Date;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty({ enum: SessionFormat, enumName: 'SessionFormat' })
  format: SessionFormat;

  @ApiProperty({ type: Number, nullable: true })
  basePriceOverride: number | null;

  @ApiProperty({ enum: SessionStatus, enumName: 'SessionStatus' })
  status: SessionStatus;

  @ApiProperty({ type: String, nullable: true })
  cancelReason: string | null;

  @ApiProperty({ type: FilmDto })
  film: FilmDto;
}
