import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { TicketsService } from '@/modules/tickets/tickets.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
