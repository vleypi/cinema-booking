import { Column, Entity } from 'typeorm';
import { TIME_COLUMN } from '@/common/database/columns.js';
import { BaseEntity } from '@/common/entities/base.entity.js';

export const DEFAULT_TIMEZONE = 'Europe/Moscow';
export const DEFAULT_CLEANING_BREAK_MINUTES = 15;

@Entity()
export class Cinema extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  address: string;

  @Column({ default: DEFAULT_TIMEZONE })
  timezone: string;

  @Column(TIME_COLUMN)
  opensAt: string;

  @Column(TIME_COLUMN)
  closesAt: string;

  @Column({ type: 'int', default: DEFAULT_CLEANING_BREAK_MINUTES })
  cleaningBreakMinutes: number;

  @Column({ default: false })
  isPublished: boolean;
}
