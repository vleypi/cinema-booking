import { Column, Entity } from 'typeorm';
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

  @Column({ type: 'time' })
  opensAt: string;

  @Column({ type: 'time' })
  closesAt: string;

  @Column({ type: 'int', default: DEFAULT_CLEANING_BREAK_MINUTES })
  cleaningBreakMinutes: number;

  @Column({ default: false })
  isPublished: boolean;
}
