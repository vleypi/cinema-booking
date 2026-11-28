import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { Refund } from '@/modules/refunds/entities/refund.entity.js';

@Entity('refund_ticket')
@Index(['refundId', 'ticketId'], { unique: true })
export class RefundTicket extends BaseEntity {
  @ManyToOne(() => Refund, (refund) => refund.refundTickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'refundId' })
  refund: Relation<Refund>;

  @Column({ type: 'bigint' })
  refundId: string;

  @ManyToOne(() => Ticket)
  @JoinColumn({ name: 'ticketId' })
  ticket: Relation<Ticket>;

  @Column({ type: 'bigint' })
  ticketId: string;
}
