import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '@/modules/customers/entities/customer.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  exports: [TypeOrmModule],
})
export class CustomersModule {}
