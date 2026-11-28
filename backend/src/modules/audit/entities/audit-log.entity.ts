import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@Entity('audit_log')
@Index(['cinemaId', 'createdAt'])
@Index(['staffUserId', 'createdAt'])
export class AuditLog extends BaseEntity {
  @ManyToOne(() => StaffUser)
  @JoinColumn({ name: 'staffUserId' })
  staffUser: Relation<StaffUser>;

  @Column({ type: 'bigint' })
  staffUserId: string;

  @ManyToOne(() => Cinema, { nullable: true })
  @JoinColumn({ name: 'cinemaId' })
  cinema: Relation<Cinema> | null;

  @Column({ type: 'bigint', nullable: true })
  cinemaId: string | null;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar' })
  entityType: string;

  @Column({ type: 'varchar' })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, unknown> | null;
}
