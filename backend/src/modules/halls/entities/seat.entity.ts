import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { HallLayout } from '@/modules/halls/entities/hall-layout.entity.js';
import { PriceZone } from '@/modules/halls/entities/price-zone.entity.js';
import { SeatType } from '@/modules/halls/seat-type.enum.js';

@Entity()
@Index(['layoutId', 'row', 'number'], { unique: true })
@Index(['layoutId', 'posX', 'posY'], { unique: true })
export class Seat extends BaseEntity {
  @ManyToOne(() => HallLayout, (layout) => layout.seats)
  @JoinColumn({ name: 'layoutId' })
  layout: Relation<HallLayout>;

  @Column({ type: 'bigint' })
  layoutId: string;

  @ManyToOne(() => PriceZone)
  @JoinColumn({ name: 'priceZoneId' })
  priceZone: Relation<PriceZone>;

  @Column({ type: 'bigint' })
  priceZoneId: string;

  @Column({ type: 'int' })
  row: number;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'int' })
  posX: number;

  @Column({ type: 'int' })
  posY: number;

  @Column({ type: 'enum', enum: SeatType, enumName: 'seat_type' })
  type: SeatType;
}
