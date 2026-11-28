import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { OrdersModule } from '@/modules/orders/orders.module.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { PaymentsController } from '@/modules/payments/payments.controller.js';
import { PaymentsService } from '@/modules/payments/payments.service.js';
import { YooKassaClient } from '@/modules/payments/yookassa.client.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order]), OrdersModule],
  controllers: [PaymentsController],
  providers: [YooKassaClient, PaymentsService],
  exports: [PaymentsService, YooKassaClient],
})
export class PaymentsModule {}
