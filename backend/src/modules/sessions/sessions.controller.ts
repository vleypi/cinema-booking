import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { Auth, CurrentStaff } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto.js';
import { ListSessionsQueryDto } from '@/modules/sessions/dto/list-sessions-query.dto.js';
import { SessionDto } from '@/modules/sessions/dto/session.dto.js';
import { SessionsService } from '@/modules/sessions/sessions.service.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@ApiTags('sessions')
@Controller()
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get('cinemas/:cinemaId/sessions')
  @Auth(Permission.ManageSchedule)
  @ApiOkResponse({ type: [SessionDto], description: 'Сеансы, которые начинаются в этот день по часовому поясу кинотеатра' })
  findByCinemaDay(@Param('cinemaId') cinemaId: string, @Query() { date }: ListSessionsQueryDto): Promise<SessionDto[]> {
    return this.sessions.findByCinemaDay(cinemaId, date);
  }

  @Post('cinemas/:cinemaId/sessions')
  @Auth(Permission.ManageSchedule)
  @ApiCreatedResponse({ type: SessionDto, description: 'Дата и время задаются в часовом поясе кинотеатра' })
  create(@Param('cinemaId') cinemaId: string, @Body() dto: CreateSessionDto): Promise<SessionDto> {
    return this.sessions.create(cinemaId, dto);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(Permission.ManageSchedule)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  remove(@CurrentStaff() actor: StaffUser, @Param('id', ParseIdPipe) id: string): Promise<void> {
    return this.sessions.remove(actor, id);
  }
}
