import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { Auth, CurrentStaff } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { CurrentCustomer, CustomerAuth } from '@/modules/customers/customer-auth.decorator.js';
import type { Customer } from '@/modules/customers/entities/customer.entity.js';
import { CreateBoxOfficeRefundDto, CreateCustomerRefundDto, CreateTokenRefundDto, RefundTokenQueryDto } from '@/modules/refunds/dto/create-refund.dto.js';
import { RefundDto, RefundPreviewDto } from '@/modules/refunds/dto/refund.dto.js';
import { RefundsService } from '@/modules/refunds/refunds.service.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@ApiTags('refunds')
@Controller()
export class RefundsController {
  constructor(private readonly refunds: RefundsService) {}

  @Post('customer/orders/:orderId/refunds')
  @CustomerAuth()
  @ApiCreatedResponse({ type: RefundDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  refundByCustomer(
    @CurrentCustomer() customer: Customer,
    @Param('orderId', ParseIdPipe) orderId: string,
    @Body() { ticketIds }: CreateCustomerRefundDto,
  ): Promise<RefundDto> {
    return this.refunds.refundByCustomer(customer.id, orderId, ticketIds);
  }

  @Get('refunds/by-token')
  @ApiOkResponse({ type: RefundPreviewDto })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  previewRefundByToken(@Query() { token }: RefundTokenQueryDto): Promise<RefundPreviewDto> {
    return this.refunds.previewRefundByToken(token);
  }

  @Post('refunds/by-token')
  @ApiCreatedResponse({ type: RefundDto })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  refundByToken(@Body() { token, ticketIds }: CreateTokenRefundDto): Promise<RefundDto> {
    return this.refunds.refundByToken(token, ticketIds);
  }

  @Post('cinemas/:cinemaId/box-office/orders/:orderId/refunds')
  @Auth(Permission.RefundTickets)
  @ApiCreatedResponse({ type: RefundDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  refundInBoxOffice(
    @Param('cinemaId', ParseIdPipe) cinemaId: string,
    @Param('orderId', ParseIdPipe) orderId: string,
    @CurrentStaff() staff: StaffUser,
    @Body() dto: CreateBoxOfficeRefundDto,
  ): Promise<RefundDto> {
    return this.refunds.refundInBoxOffice(cinemaId, staff.id, orderId, dto);
  }
}
