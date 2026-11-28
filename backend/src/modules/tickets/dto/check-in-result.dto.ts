import { ApiProperty } from '@nestjs/swagger';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { CheckInReasonCode } from '@/modules/tickets/tickets.constant.js';

export class CheckInTicketDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty()
  row: number;

  @ApiProperty()
  number: number;

  @ApiProperty()
  filmTitle: string;

  @ApiProperty({ enum: AgeRating })
  ageRating: AgeRating;

  @ApiProperty()
  hallId: string;

  @ApiProperty()
  hallName: string;

  @ApiProperty()
  cinemaName: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty({ type: Date, nullable: true })
  usedAt: Date | null;

  @ApiProperty({ type: String, nullable: true })
  usedByName: string | null;
}

export class CheckInResultDto {
  @ApiProperty()
  allowed: boolean;

  @ApiProperty({ enum: CheckInReasonCode, nullable: true })
  reasonCode: CheckInReasonCode | null;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: CheckInTicketDetailsDto, nullable: true })
  ticket: CheckInTicketDetailsDto | null;
}

export class CheckInHallOptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  format: string;
}
