import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Film } from '@/modules/films/entities/film.entity.js';
import { HallLayout } from '@/modules/halls/entities/hall-layout.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';

@Entity()
@Index(['hallId', 'startsAt'])
export class Session extends BaseEntity {
  @ManyToOne(() => Film)
  @JoinColumn({ name: 'filmId' })
  film: Relation<Film>;

  @Column({ type: 'bigint' })
  filmId: string;

  @ManyToOne(() => Hall)
  @JoinColumn({ name: 'hallId' })
  hall: Relation<Hall>;

  @Column({ type: 'bigint' })
  hallId: string;

  @ManyToOne(() => HallLayout)
  @JoinColumn({ name: 'layoutId' })
  layout: Relation<HallLayout>;

  @Column({ type: 'bigint' })
  layoutId: string;

  @Column({ type: 'timestamptz' })
  startsAt: Date;

  @Column({ type: 'timestamptz' })
  endsAt: Date;

  @Column({ type: 'enum', enum: SessionFormat, enumName: 'session_format' })
  format: SessionFormat;

  @Column({ type: 'int', nullable: true })
  basePriceOverride: number | null;

  @Column({ type: 'enum', enum: SessionStatus, enumName: 'session_status', default: SessionStatus.Scheduled })
  status: SessionStatus;

  @Column({ type: 'varchar', nullable: true })
  cancelReason: string | null;
}
