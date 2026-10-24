import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';

export enum TokenOwnerType {
  Customer = 'CUSTOMER',
  Staff = 'STAFF',
}

@Entity()
@Index(['ownerType', 'ownerId'])
export class RefreshToken extends BaseEntity {
  @Column({ type: 'enum', enum: TokenOwnerType, enumName: 'token_owner_type' })
  ownerType: TokenOwnerType;

  @Column({ type: 'bigint' })
  ownerId: string;

  @Column({ unique: true })
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;
}
