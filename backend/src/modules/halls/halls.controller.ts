import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { Auth, CurrentStaff } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { CreateHallLayoutDto } from '@/modules/halls/dto/create-hall-layout.dto.js';
import { CreateHallDto } from '@/modules/halls/dto/create-hall.dto.js';
import { CreatePriceZoneDto } from '@/modules/halls/dto/create-price-zone.dto.js';
import { HallLayoutDto } from '@/modules/halls/dto/hall-layout.dto.js';
import { HallDto } from '@/modules/halls/dto/hall.dto.js';
import { PriceZoneDto } from '@/modules/halls/dto/price-zone.dto.js';
import { UpdateHallDto } from '@/modules/halls/dto/update-hall.dto.js';
import { UpdatePriceZoneDto } from '@/modules/halls/dto/update-price-zone.dto.js';
import { HallsService } from '@/modules/halls/halls.service.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@ApiTags('halls')
@Controller()
export class HallsController {
  constructor(private readonly halls: HallsService) {}

  @Get('cinemas/:cinemaId/halls')
  @Auth(Permission.ManageSchedule)
  @ApiOkResponse({ type: [HallDto] })
  findByCinema(@Param('cinemaId') cinemaId: string): Promise<HallDto[]> {
    return this.halls.findByCinema(cinemaId);
  }

  @Post('cinemas/:cinemaId/halls')
  @Auth(Permission.ManageHalls)
  @ApiCreatedResponse({ type: HallDto })
  create(@Param('cinemaId') cinemaId: string, @Body() dto: CreateHallDto): Promise<HallDto> {
    return this.halls.create(cinemaId, dto);
  }

  @Patch('halls/:id')
  @Auth(Permission.ManageHalls)
  @ApiOkResponse({ type: HallDto })
  @ApiNotFoundResponse()
  update(@CurrentStaff() actor: StaffUser, @Param('id', ParseIdPipe) id: string, @Body() dto: UpdateHallDto): Promise<HallDto> {
    return this.halls.update(actor, id, dto);
  }

  @Post('halls/:id/price-zones')
  @Auth(Permission.ManageHalls)
  @ApiCreatedResponse({ type: PriceZoneDto })
  @ApiNotFoundResponse()
  createPriceZone(@CurrentStaff() actor: StaffUser, @Param('id', ParseIdPipe) id: string, @Body() dto: CreatePriceZoneDto): Promise<PriceZoneDto> {
    return this.halls.createPriceZone(actor, id, dto);
  }

  @Patch('price-zones/:id')
  @Auth(Permission.ManageHalls)
  @ApiOkResponse({ type: PriceZoneDto })
  @ApiNotFoundResponse()
  updatePriceZone(@CurrentStaff() actor: StaffUser, @Param('id', ParseIdPipe) id: string, @Body() dto: UpdatePriceZoneDto): Promise<PriceZoneDto> {
    return this.halls.updatePriceZone(actor, id, dto);
  }

  @Delete('price-zones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(Permission.ManageHalls)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  removePriceZone(@CurrentStaff() actor: StaffUser, @Param('id', ParseIdPipe) id: string): Promise<void> {
    return this.halls.removePriceZone(actor, id);
  }

  @Get('halls/:id/layout')
  @Auth(Permission.ManageHalls)
  @ApiOkResponse({ type: HallLayoutDto })
  @ApiNotFoundResponse()
  findCurrentLayout(@CurrentStaff() actor: StaffUser, @Param('id', ParseIdPipe) id: string): Promise<HallLayoutDto> {
    return this.halls.findCurrentLayout(actor, id);
  }

  @Post('halls/:id/layouts')
  @Auth(Permission.ManageHalls)
  @ApiCreatedResponse({ type: HallLayoutDto, description: 'Новая версия схемы становится текущей, старые сеансы сохраняют свою' })
  @ApiNotFoundResponse()
  createLayout(@CurrentStaff() actor: StaffUser, @Param('id', ParseIdPipe) id: string, @Body() dto: CreateHallLayoutDto): Promise<HallLayoutDto> {
    return this.halls.createLayout(actor, id, dto);
  }
}
