import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrdersController } from '@/modules/orders/orders.controller.js';
import { OrdersService } from '@/modules/orders/orders.service.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Ticket, Customer, Session, Seat, TimeBand])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
