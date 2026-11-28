import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';

@Entity()
export class Customer extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;
}
