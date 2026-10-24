import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffController } from '@/modules/staff/staff.controller.js';
import { StaffService } from '@/modules/staff/staff.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([StaffUser, Cinema])],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
