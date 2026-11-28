import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PaymentStatus } from '@/modules/payments/payment-status.enum.js';

export class PaymentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty({ enum: PaymentProvider })
  provider: PaymentProvider;

  @ApiProperty({ type: String, nullable: true })
  externalId: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ type: String, nullable: true })
  confirmationUrl: string | null;

  @ApiProperty({ type: Date, nullable: true })
  paidAt: Date | null;
}

export class WebhookAckDto {
  @ApiProperty()
  ok: boolean;
}
