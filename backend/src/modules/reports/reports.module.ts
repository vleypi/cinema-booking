import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { ReportsController } from '@/modules/reports/reports.controller.js';
import { ReportsService } from '@/modules/reports/reports.service.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Session, Seat, Ticket])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
