import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { MULTIPLIER_COLUMN, TIME_COLUMN } from '@/common/database/columns.js';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';

@Entity()
@Index(['cinemaId', 'startsAt'], { unique: true })
export class TimeBand extends BaseEntity {
  @ManyToOne(() => Cinema)
  @JoinColumn({ name: 'cinemaId' })
  cinema: Relation<Cinema>;

  @Column({ type: 'bigint' })
  cinemaId: string;

  @Column()
  name: string;

  @Column(TIME_COLUMN)
  startsAt: string;

  @Column(TIME_COLUMN)
  endsAt: string;

  @Column(MULTIPLIER_COLUMN)
  multiplier: number;
}
