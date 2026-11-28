import { ApiProperty } from '@nestjs/swagger';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { SeatType } from '@/modules/halls/seat-type.enum.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';

export class SessionSeatDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  row: number;

  @ApiProperty()
  number: number;

  @ApiProperty()
  posX: number;

  @ApiProperty()
  posY: number;

  @ApiProperty({ enum: SeatType })
  type: SeatType;

  @ApiProperty()
  priceZoneId: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  isAvailable: boolean;
}

export class SessionPriceZoneDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  multiplier: number;

  @ApiProperty()
  price: number;
}

export class SessionSeatsFilmDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: AgeRating })
  ageRating: AgeRating;

  @ApiProperty()
  durationMinutes: number;
}

export class SessionSeatsHallDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  format: string;
}

export class SessionSeatsCinemaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  timezone: string;
}

export class SessionSeatsDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty({ enum: SessionFormat })
  format: SessionFormat;

  @ApiProperty({ type: SessionSeatsFilmDto })
  film: SessionSeatsFilmDto;

  @ApiProperty({ type: SessionSeatsHallDto })
  hall: SessionSeatsHallDto;

  @ApiProperty({ type: SessionSeatsCinemaDto })
  cinema: SessionSeatsCinemaDto;

  @ApiProperty({ type: [SessionPriceZoneDto] })
  priceZones: SessionPriceZoneDto[];

  @ApiProperty({ type: [SessionSeatDto] })
  seats: SessionSeatDto[];
}
