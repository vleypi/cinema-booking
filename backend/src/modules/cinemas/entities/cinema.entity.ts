import { Column, Entity, type ValueTransformer } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';

export const DEFAULT_TIMEZONE = 'Europe/Moscow';
export const DEFAULT_CLEANING_BREAK_MINUTES = 15;

const HOURS_MINUTES_LENGTH = 5;
const hoursMinutes: ValueTransformer = { to: (time: string) => time, from: (time: string | null) => time?.slice(0, HOURS_MINUTES_LENGTH) ?? null };

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

  @Column({ type: 'time', transformer: hoursMinutes })
  opensAt: string;

  @Column({ type: 'time', transformer: hoursMinutes })
  closesAt: string;

  @Column({ type: 'int', default: DEFAULT_CLEANING_BREAK_MINUTES })
  cleaningBreakMinutes: number;

  @Column({ default: false })
  isPublished: boolean;
}
