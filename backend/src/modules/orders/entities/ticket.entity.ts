import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@Entity()
@Index(['sessionId', 'seatId'], { unique: true, where: `"status" IN ('RESERVED', 'ACTIVE', 'USED')` })
export class Ticket extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.tickets)
  @JoinColumn({ name: 'orderId' })
  order: Relation<Order>;

  @Column({ type: 'bigint' })
  orderId: string;

  @ManyToOne(() => Session)
  @JoinColumn({ name: 'sessionId' })
  session: Relation<Session>;

  @Column({ type: 'bigint' })
  sessionId: string;

  @ManyToOne(() => Seat)
  @JoinColumn({ name: 'seatId' })
  seat: Relation<Seat>;

  @Column({ type: 'bigint' })
  seatId: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'enum', enum: TicketStatus, enumName: 'ticket_status', default: TicketStatus.Reserved })
  status: TicketStatus;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @ManyToOne(() => StaffUser, { nullable: true })
  @JoinColumn({ name: 'usedById' })
  usedBy: Relation<StaffUser> | null;

  @Column({ type: 'bigint', nullable: true })
  usedById: string | null;
}
