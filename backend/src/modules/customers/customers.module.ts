import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '@/modules/auth/entities/refresh-token.entity.js';
import { CustomerAuthGuard } from '@/modules/customers/customer-auth.guard.js';
import { CustomersController } from '@/modules/customers/customers.controller.js';
import { CustomersService } from '@/modules/customers/customers.service.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { TicketsModule } from '@/modules/tickets/tickets.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, RefreshToken, Order]), TicketsModule],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerAuthGuard],
  exports: [TypeOrmModule, CustomersService, CustomerAuthGuard],
})
export class CustomersModule {}
