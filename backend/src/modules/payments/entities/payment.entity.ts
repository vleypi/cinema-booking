import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PaymentStatus } from '@/modules/payments/payment-status.enum.js';

@Entity('payment')
@Index(['orderId'])
@Index(['externalId'])
export class Payment extends BaseEntity {
  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Relation<Order>;

  @Column({ type: 'bigint' })
  orderId: string;

  @Column({ type: 'enum', enum: PaymentProvider, enumName: 'payment_provider' })
  provider: PaymentProvider;

  @Column({ type: 'varchar', nullable: true })
  externalId: string | null;

  @Column({ type: 'varchar', unique: true })
  idempotenceKey: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, enumName: 'payment_status', default: PaymentStatus.Pending })
  status: PaymentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}
