import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { MULTIPLIER_COLUMN } from '@/common/database/columns.js';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';

@Entity()
export class PriceZone extends BaseEntity {
  @ManyToOne(() => Hall, (hall) => hall.priceZones)
  @JoinColumn({ name: 'hallId' })
  hall: Relation<Hall>;

  @Column({ type: 'bigint' })
  hallId: string;

  @Column()
  name: string;

  @Column(MULTIPLIER_COLUMN)
  multiplier: number;
}
