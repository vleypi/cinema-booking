import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '@/modules/customers/customers.module.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { PaymentsModule } from '@/modules/payments/payments.module.js';
import { RefundTicket } from '@/modules/refunds/entities/refund-ticket.entity.js';
import { Refund } from '@/modules/refunds/entities/refund.entity.js';
import { RefundsController } from '@/modules/refunds/refunds.controller.js';
import { RefundsService } from '@/modules/refunds/refunds.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Refund, RefundTicket, Order, Ticket, Payment]), CustomersModule, PaymentsModule],
  controllers: [RefundsController],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
