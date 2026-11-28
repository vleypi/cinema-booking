import { ApiProperty } from '@nestjs/swagger';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';

export class OrderTicketDto {
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
}

export class OrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  cinemaId: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty({ type: String, nullable: true })
  contactEmail: string | null;

  @ApiProperty({ enum: OrderChannel })
  channel: OrderChannel;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ type: Date, nullable: true })
  holdExpiresAt: Date | null;

  @ApiProperty()
  ageConfirmed: boolean;

  @ApiProperty({ type: [OrderTicketDto] })
  tickets: OrderTicketDto[];
}
