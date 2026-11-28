import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { Auth, CurrentStaff } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { CheckInHallOptionDto, CheckInResultDto } from '@/modules/tickets/dto/check-in-result.dto.js';
import { CheckInTicketDto } from '@/modules/tickets/dto/check-in-ticket.dto.js';
import { TicketsService } from '@/modules/tickets/tickets.service.js';

@ApiTags('tickets')
@Controller('cinemas/:cinemaId/tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get('halls')
  @Auth(Permission.ScanTickets)
  @ApiOkResponse({ type: [CheckInHallOptionDto] })
  listCinemaHalls(@Param('cinemaId', ParseIdPipe) cinemaId: string): Promise<CheckInHallOptionDto[]> {
    return this.tickets.listCinemaHalls(cinemaId);
  }

  @Post('check-in')
  @Auth(Permission.ScanTickets)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CheckInResultDto })
  @ApiBadRequestResponse()
  checkIn(
    @Param('cinemaId', ParseIdPipe) cinemaId: string,
    @CurrentStaff() staff: StaffUser,
    @Body() dto: CheckInTicketDto,
  ): Promise<CheckInResultDto> {
    return this.tickets.checkInTicket(cinemaId, staff, dto);
  }
}
