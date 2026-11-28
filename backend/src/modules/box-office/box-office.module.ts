import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoxOfficeController } from '@/modules/box-office/box-office.controller.js';
import { BoxOfficeService } from '@/modules/box-office/box-office.service.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrdersModule } from '@/modules/orders/orders.module.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { TicketsModule } from '@/modules/tickets/tickets.module.js';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema, Order, Ticket, Payment, Customer, Session, Seat, TimeBand]), OrdersModule, TicketsModule],
  controllers: [BoxOfficeController],
  providers: [BoxOfficeService],
  exports: [BoxOfficeService],
})
export class BoxOfficeModule {}
