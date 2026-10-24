import { Column, Entity, JoinColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { PriceZone } from '@/modules/halls/entities/price-zone.entity.js';

@Entity()
export class Hall extends BaseEntity {
  @ManyToOne(() => Cinema)
  @JoinColumn({ name: 'cinemaId' })
  cinema: Relation<Cinema>;

  @Column({ type: 'bigint' })
  cinemaId: string;

  @Column()
  name: string;

  @Column()
  format: string;

  @Column({ type: 'int' })
  basePrice: number;

  @Column({ default: true })
  useTimeBands: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PriceZone, (priceZone) => priceZone.hall)
  priceZones: Relation<PriceZone>[];
}
