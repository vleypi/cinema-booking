import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';

export class ReportPeriodQueryDto {
  @ApiPropertyOptional({ description: 'Начало периода (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Конец периода (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class RevenueTotalsDto {
  @ApiProperty()
  grossAmount: number;

  @ApiProperty()
  refundedAmount: number;

  @ApiProperty()
  netRevenue: number;

  @ApiProperty()
  ticketsSold: number;

  @ApiProperty()
  ticketsRefunded: number;
}

export class RevenueByFilmDto extends RevenueTotalsDto {
  @ApiProperty()
  filmId: string;

  @ApiProperty()
  filmTitle: string;
}

export class RevenueByHallDto extends RevenueTotalsDto {
  @ApiProperty()
  hallId: string;

  @ApiProperty()
  hallName: string;
}

export class RevenueByChannelDto extends RevenueTotalsDto {
  @ApiProperty({ enum: OrderChannel })
  channel: OrderChannel;
}

export class RevenueReportDto {
  @ApiProperty({ type: RevenueTotalsDto })
  totals: RevenueTotalsDto;

  @ApiProperty({ type: [RevenueByFilmDto] })
  byFilm: RevenueByFilmDto[];

  @ApiProperty({ type: [RevenueByHallDto] })
  byHall: RevenueByHallDto[];

  @ApiProperty({ type: [RevenueByChannelDto] })
  byChannel: RevenueByChannelDto[];
}

export class OccupancySessionItemDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  filmTitle: string;

  @ApiProperty()
  hallName: string;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty()
  totalSeats: number;

  @ApiProperty()
  soldTickets: number;

  @ApiProperty()
  occupancyPercent: number;
}
