import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@Entity('order')
@Index(['sessionId', 'status'])
@Index(['status', 'holdExpiresAt'])
export class Order extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  number: string;

  @ManyToOne(() => Cinema)
  @JoinColumn({ name: 'cinemaId' })
  cinema: Relation<Cinema>;

  @Column({ type: 'bigint' })
  cinemaId: string;

  @ManyToOne(() => Session)
  @JoinColumn({ name: 'sessionId' })
  session: Relation<Session>;

  @Column({ type: 'bigint' })
  sessionId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Relation<Customer> | null;

  @Column({ type: 'bigint', nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', nullable: true })
  contactEmail: string | null;

  @Column({ type: 'enum', enum: OrderChannel, enumName: 'order_channel' })
  channel: OrderChannel;

  @ManyToOne(() => StaffUser, { nullable: true })
  @JoinColumn({ name: 'cashierId' })
  cashier: Relation<StaffUser> | null;

  @Column({ type: 'bigint', nullable: true })
  cashierId: string | null;

  @Column({ type: 'enum', enum: OrderStatus, enumName: 'order_status', default: OrderStatus.PendingPayment })
  status: OrderStatus;

  @Column({ type: 'int' })
  totalAmount: number;

  @Column({ type: 'timestamptz', nullable: true })
  holdExpiresAt: Date | null;

  @Column({ type: 'boolean', default: false })
  ageConfirmed: boolean;

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Relation<Ticket[]>;
}
