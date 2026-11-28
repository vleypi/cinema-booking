import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import type { EnvironmentVariables } from '@/config/environment.js';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_MS } from '@/modules/auth/auth.constant.js';
import type { IAuthTokens } from '@/modules/auth/auth.service.js';
import { SessionDto } from '@/modules/auth/dto/staff-profile.dto.js';
import { CurrentCustomer, CustomerAuth } from '@/modules/customers/customer-auth.decorator.js';
import { CUSTOMER_COOKIE_NAMES } from '@/modules/customers/customers.constant.js';
import { CustomersService } from '@/modules/customers/customers.service.js';
import { CustomerOrderDto, CustomerOrdersListDto } from '@/modules/customers/dto/customer-order.dto.js';
import { CustomerProfileDto } from '@/modules/customers/dto/customer-profile.dto.js';
import { RequestOtpDto } from '@/modules/customers/dto/request-otp.dto.js';
import { UpdateCustomerProfileDto } from '@/modules/customers/dto/update-customer-profile.dto.js';
import { VerifyOtpDto } from '@/modules/customers/dto/verify-otp.dto.js';
import type { Customer } from '@/modules/customers/entities/customer.entity.js';
import { TicketsService } from '@/modules/tickets/tickets.service.js';

@ApiTags('customer')
@Controller('customer')
export class CustomersController {
  readonly #cookieOptions: CookieOptions;

  constructor(
    private readonly customers: CustomersService,
    private readonly tickets: TicketsService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.#cookieOptions = { httpOnly: true, secure: config.get('COOKIE_SECURE', { infer: true }), sameSite: 'lax', path: '/' };
  }

  @Post('auth/request-otp')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiTooManyRequestsResponse()
  requestOtp(@Body() { email }: RequestOtpDto): Promise<void> {
    return this.customers.requestOtp(email);
  }

  @Post('auth/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CustomerProfileDto })
  async verifyOtp(@Body() { email, code }: VerifyOtpDto, @Res({ passthrough: true }) response: Response): Promise<CustomerProfileDto> {
    const { customer, tokens } = await this.customers.verifyOtp(email, code);
    this.#setCookies(response, tokens);

    return this.customers.getProfile(customer);
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    try {
      const { tokens } = await this.customers.refresh(request.cookies?.[CUSTOMER_COOKIE_NAMES.refresh]);
      this.#setCookies(response, tokens);
    } catch (error) {
      this.#clearCookies(response);
      throw error;
    }
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.customers.logout(request.cookies?.[CUSTOMER_COOKIE_NAMES.refresh]);
    this.#clearCookies(response);
  }

  @Get('auth/session')
  @CustomerAuth()
  @ApiOkResponse({ type: SessionDto })
  checkSession(): SessionDto {
    return { authenticated: true };
  }

  @Get('me')
  @CustomerAuth()
  @ApiOkResponse({ type: CustomerProfileDto })
  me(@CurrentCustomer() customer: Customer): CustomerProfileDto {
    return this.customers.getProfile(customer);
  }

  @Patch('me')
  @CustomerAuth()
  @ApiOkResponse({ type: CustomerProfileDto })
  updateProfile(@CurrentCustomer() customer: Customer, @Body() dto: UpdateCustomerProfileDto): Promise<CustomerProfileDto> {
    return this.customers.updateProfile(customer, dto);
  }

  @Get('orders')
  @CustomerAuth()
  @ApiOkResponse({ type: CustomerOrdersListDto })
  getOrders(@CurrentCustomer() customer: Customer): Promise<CustomerOrdersListDto> {
    return this.customers.getOrders(customer.id);
  }

  @Get('orders/:id')
  @CustomerAuth()
  @ApiOkResponse({ type: CustomerOrderDto })
  @ApiNotFoundResponse()
  getOrder(@CurrentCustomer() customer: Customer, @Param('id', ParseIdPipe) id: string): Promise<CustomerOrderDto> {
    return this.customers.getOrder(customer.id, id);
  }

  @Get('orders/:id/pdf')
  @CustomerAuth()
  @ApiNotFoundResponse()
  async downloadOrderPdf(
    @CurrentCustomer() customer: Customer,
    @Param('id', ParseIdPipe) id: string,
    @Res() response: Response,
  ): Promise<void> {
    const { filename, buffer } = await this.tickets.generateOrderPdfForCustomer(customer.id, id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.send(buffer);
  }

  @Get('orders/:id/tickets/:ticketId/qr')
  @CustomerAuth()
  @ApiNotFoundResponse()
  async getTicketQrImage(
    @CurrentCustomer() customer: Customer,
    @Param('id', ParseIdPipe) id: string,
    @Param('ticketId', ParseIdPipe) ticketId: string,
    @Res() response: Response,
  ): Promise<void> {
    const buffer = await this.tickets.generateTicketQrPngForCustomer(customer.id, id, ticketId);
    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Cache-Control', 'private, max-age=3600');
    response.send(buffer);
  }

  #setCookies(response: Response, { accessToken, refreshToken }: IAuthTokens): void {
    response.cookie(CUSTOMER_COOKIE_NAMES.access, accessToken, { ...this.#cookieOptions, maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000 });
    response.cookie(CUSTOMER_COOKIE_NAMES.refresh, refreshToken, { ...this.#cookieOptions, maxAge: REFRESH_TOKEN_TTL_MS });
  }

  #clearCookies(response: Response): void {
    response.clearCookie(CUSTOMER_COOKIE_NAMES.access, this.#cookieOptions);
    response.clearCookie(CUSTOMER_COOKIE_NAMES.refresh, this.#cookieOptions);
  }
}
