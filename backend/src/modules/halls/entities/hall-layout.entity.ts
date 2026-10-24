import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';

@Entity()
@Index(['hallId', 'version'], { unique: true })
@Index(['hallId'], { unique: true, where: '"isCurrent"' })
export class HallLayout extends BaseEntity {
  @ManyToOne(() => Hall)
  @JoinColumn({ name: 'hallId' })
  hall: Relation<Hall>;

  @Column({ type: 'bigint' })
  hallId: string;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'int' })
  rows: number;

  @Column()
  isCurrent: boolean;

  @OneToMany(() => Seat, (seat) => seat.layout)
  seats: Relation<Seat>[];
}
