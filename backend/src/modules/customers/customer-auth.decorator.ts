import { applyDecorators, createParamDecorator, type ExecutionContext, UseGuards } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CustomerAuthGuard, type ICustomerAuthenticatedRequest } from '@/modules/customers/customer-auth.guard.js';

export const CustomerAuth = () => applyDecorators(UseGuards(CustomerAuthGuard), ApiUnauthorizedResponse());

export const CurrentCustomer = createParamDecorator((_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<ICustomerAuthenticatedRequest>().customer);
