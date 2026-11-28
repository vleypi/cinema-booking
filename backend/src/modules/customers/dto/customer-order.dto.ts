import { ApiProperty } from '@nestjs/swagger';
import { SeatType } from '@/modules/halls/seat-type.enum.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';

export class CustomerOrderTicketDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty()
  row: number;

  @ApiProperty()
  number: number;

  @ApiProperty({ enum: SeatType })
  seatType: SeatType;

  @ApiProperty({ type: String, nullable: true })
  qrPayload: string | null;
}

export class CustomerOrderCinemaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  timezone: string;
}

export class CustomerOrderSessionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty({ enum: SessionFormat })
  format: SessionFormat;

  @ApiProperty()
  filmId: string;

  @ApiProperty()
  filmTitle: string;

  @ApiProperty({ type: String, nullable: true })
  posterFileId: string | null;

  @ApiProperty()
  hallName: string;
}

export class CustomerOrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: string;

  @ApiProperty({ enum: OrderChannel })
  channel: OrderChannel;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ type: Date, nullable: true })
  holdExpiresAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: CustomerOrderCinemaDto })
  cinema: CustomerOrderCinemaDto;

  @ApiProperty({ type: CustomerOrderSessionDto })
  session: CustomerOrderSessionDto;

  @ApiProperty({ type: [CustomerOrderTicketDto] })
  tickets: CustomerOrderTicketDto[];
}

export class CustomerOrdersListDto {
  @ApiProperty({ type: [CustomerOrderDto] })
  upcoming: CustomerOrderDto[];

  @ApiProperty({ type: [CustomerOrderDto] })
  past: CustomerOrderDto[];
}
