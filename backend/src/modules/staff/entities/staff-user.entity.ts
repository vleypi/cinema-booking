import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

@Entity()
export class StaffUser extends BaseEntity {
  @Column({ unique: true })
  login: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ type: 'enum', enum: StaffRole, enumName: 'staff_role' })
  role: StaffRole;

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ default: true })
  mustChangePassword: boolean;

  @ManyToMany(() => Cinema)
  @JoinTable({ name: 'staff_cinema', joinColumn: { name: 'staffUserId' }, inverseJoinColumn: { name: 'cinemaId' } })
  cinemas: Cinema[];
}
