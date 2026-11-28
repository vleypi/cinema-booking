import { ApiProperty } from '@nestjs/swagger';
import { SeatType } from '@/modules/halls/seat-type.enum.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';

export class BoxOfficeOrderTicketDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  seatId: string;

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

export class BoxOfficeOrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  cinemaId: string;

  @ApiProperty({ enum: OrderChannel })
  channel: OrderChannel;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ type: String, nullable: true })
  contactEmail: string | null;

  @ApiProperty({ type: String, nullable: true })
  customerName: string | null;

  @ApiProperty({ type: String, nullable: true })
  customerPhone: string | null;

  @ApiProperty({ type: String, nullable: true })
  cashierId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  session: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    format: SessionFormat;
    filmTitle: string;
    hallName: string;
  };

  @ApiProperty({ type: [BoxOfficeOrderTicketDto] })
  tickets: BoxOfficeOrderTicketDto[];
}
