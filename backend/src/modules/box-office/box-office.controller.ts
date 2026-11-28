import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { Auth, CurrentStaff } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { BoxOfficeService } from '@/modules/box-office/box-office.service.js';
import { BoxOfficeOrderDto } from '@/modules/box-office/dto/box-office-order.dto.js';
import { CreateBoxOfficeOrderDto } from '@/modules/box-office/dto/create-box-office-order.dto.js';
import { PrintOrderPdfQueryDto } from '@/modules/box-office/dto/print-order-pdf-query.dto.js';
import { SearchOrdersQueryDto } from '@/modules/box-office/dto/search-orders-query.dto.js';
import { SessionSeatsDto } from '@/modules/orders/dto/session-seats.dto.js';
import { ListSessionsQueryDto } from '@/modules/sessions/dto/list-sessions-query.dto.js';
import { SessionDto } from '@/modules/sessions/dto/session.dto.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { TicketsService } from '@/modules/tickets/tickets.service.js';

@ApiTags('box-office')
@Controller('cinemas/:cinemaId/box-office')
export class BoxOfficeController {
  constructor(
    private readonly boxOffice: BoxOfficeService,
    private readonly tickets: TicketsService,
  ) {}

  @Get('sessions')
  @Auth(Permission.SellTickets)
  @ApiOkResponse({ type: [SessionDto] })
  findSessionsByDay(
    @Param('cinemaId', ParseIdPipe) cinemaId: string,
    @Query() { date }: ListSessionsQueryDto,
  ): Promise<SessionDto[]> {
    return this.boxOffice.findSessionsByDay(cinemaId, date);
  }

  @Get('sessions/:sessionId/seats')
  @Auth(Permission.SellTickets)
  @ApiOkResponse({ type: SessionSeatsDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  getSessionSeats(
    @Param('cinemaId', ParseIdPipe) cinemaId: string,
    @Param('sessionId', ParseIdPipe) sessionId: string,
  ): Promise<SessionSeatsDto> {
    return this.boxOffice.getSessionSeats(cinemaId, sessionId);
  }

  @Post('orders')
  @Auth(Permission.SellTickets)
  @ApiCreatedResponse({ type: BoxOfficeOrderDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  createOrder(
    @Param('cinemaId', ParseIdPipe) cinemaId: string,
    @CurrentStaff() staff: StaffUser,
    @Body() dto: CreateBoxOfficeOrderDto,
  ): Promise<BoxOfficeOrderDto> {
    return this.boxOffice.createOrder(cinemaId, staff.id, dto);
  }

  @Get('orders')
  @Auth(Permission.SearchOrders)
  @ApiOkResponse({ type: [BoxOfficeOrderDto] })
  searchOrders(
    @Param('cinemaId', ParseIdPipe) cinemaId: string,
    @Query() { query }: SearchOrdersQueryDto,
  ): Promise<BoxOfficeOrderDto[]> {
    return this.boxOffice.searchOrders(cinemaId, query);
  }

  @Get('orders/:orderId/pdf')
  @Auth(Permission.SellTickets)
  @ApiNotFoundResponse()
  async printOrderPdf(
    @Param('cinemaId', ParseIdPipe) cinemaId: string,
    @Param('orderId', ParseIdPipe) orderId: string,
    @Query() { format = 'a4' }: PrintOrderPdfQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    const { filename, buffer } = await this.tickets.generateOrderPdfForCinema(cinemaId, orderId, format);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    response.send(buffer);
  }
}
