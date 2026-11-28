import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { RefundTicket } from '@/modules/refunds/entities/refund-ticket.entity.js';
import { RefundInitiatorType } from '@/modules/refunds/refund-initiator-type.enum.js';
import { RefundReason } from '@/modules/refunds/refund-reason.enum.js';
import { RefundStatus } from '@/modules/refunds/refund-status.enum.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@Entity('refund')
@Index(['paymentId'])
export class Refund extends BaseEntity {
  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'paymentId' })
  payment: Relation<Payment>;

  @Column({ type: 'bigint' })
  paymentId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'enum', enum: RefundReason, enumName: 'refund_reason' })
  reason: RefundReason;

  @Column({ type: 'enum', enum: RefundInitiatorType, enumName: 'refund_initiator_type' })
  initiatorType: RefundInitiatorType;

  @ManyToOne(() => StaffUser, { nullable: true })
  @JoinColumn({ name: 'initiatorStaffId' })
  initiatorStaff: Relation<StaffUser> | null;

  @Column({ type: 'bigint', nullable: true })
  initiatorStaffId: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalId: string | null;

  @Column({ type: 'enum', enum: RefundStatus, enumName: 'refund_status', default: RefundStatus.Pending })
  status: RefundStatus;

  @OneToMany(() => RefundTicket, (refundTicket) => refundTicket.refund)
  refundTickets: Relation<RefundTicket[]>;
}
