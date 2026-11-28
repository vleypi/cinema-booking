import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { CreateOrderDto } from '@/modules/orders/dto/create-order.dto.js';
import { OrderDto } from '@/modules/orders/dto/order.dto.js';
import { SessionSeatsDto } from '@/modules/orders/dto/session-seats.dto.js';
import { OrdersService } from '@/modules/orders/orders.service.js';

@ApiTags('orders')
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('sessions/:sessionId/seats')
  @ApiOkResponse({ type: SessionSeatsDto, description: 'Схема зала сеанса с ценами и занятостью мест' })
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  getSessionSeats(@Param('sessionId', ParseIdPipe) sessionId: string): Promise<SessionSeatsDto> {
    return this.orders.getSessionSeats(sessionId);
  }

  @Post('orders')
  @ApiCreatedResponse({ type: OrderDto, description: 'Созданный онлайн-заказ с бронью мест на 10 минут' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  createOnlineOrder(@Body() dto: CreateOrderDto): Promise<OrderDto> {
    return this.orders.createOnlineOrder(dto);
  }
}
