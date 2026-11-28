import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { RefundInitiatorType } from '@/modules/refunds/refund-initiator-type.enum.js';
import { RefundReason } from '@/modules/refunds/refund-reason.enum.js';
import { RefundStatus } from '@/modules/refunds/refund-status.enum.js';

export class RefundDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty({ enum: OrderStatus })
  orderStatus: OrderStatus;

  @ApiProperty()
  paymentId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: RefundReason })
  reason: RefundReason;

  @ApiProperty({ enum: RefundInitiatorType })
  initiatorType: RefundInitiatorType;

  @ApiProperty({ enum: RefundStatus })
  status: RefundStatus;

  @ApiProperty({ type: [String] })
  ticketIds: string[];
}

export class RefundPreviewTicketDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  row: number;

  @ApiProperty()
  number: number;

  @ApiProperty()
  price: number;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;
}

export class RefundPreviewDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  filmTitle: string;

  @ApiProperty()
  cinemaName: string;

  @ApiProperty()
  hallName: string;

  @ApiProperty()
  startsAt: Date;

  @ApiProperty({ type: [RefundPreviewTicketDto] })
  tickets: RefundPreviewTicketDto[];
}
