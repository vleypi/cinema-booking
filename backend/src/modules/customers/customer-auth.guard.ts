import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { CUSTOMER_COOKIE_NAMES } from '@/modules/customers/customers.constant.js';
import { CustomersService } from '@/modules/customers/customers.service.js';
import type { Customer } from '@/modules/customers/entities/customer.entity.js';

export interface ICustomerAuthenticatedRequest extends Request {
  customer: Customer;
}

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly customers: CustomersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ICustomerAuthenticatedRequest>();
    request.customer = await this.customers.findVerifiedCustomerByAccessToken(request.cookies?.[CUSTOMER_COOKIE_NAMES.access]);

    return true;
  }
}
