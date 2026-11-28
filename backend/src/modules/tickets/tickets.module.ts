import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { TicketsController } from '@/modules/tickets/tickets.controller.js';
import { TicketsService } from '@/modules/tickets/tickets.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Ticket, Hall])],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
