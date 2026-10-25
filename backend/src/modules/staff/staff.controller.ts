import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { type IPage, PageDto } from '@/common/pagination/page.js';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { Auth, CurrentStaff } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { CreateStaffDto } from '@/modules/staff/dto/create-staff.dto.js';
import { ListStaffQueryDto } from '@/modules/staff/dto/list-staff-query.dto.js';
import { StaffDto } from '@/modules/staff/dto/staff.dto.js';
import { UpdateStaffDto } from '@/modules/staff/dto/update-staff.dto.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffService } from '@/modules/staff/staff.service.js';

@ApiTags('staff')
@Controller()
export class StaffController {
  constructor(private readonly staff: StaffService) {}

  @Get('cinemas/:cinemaId/staff')
  @Auth(Permission.ManageStaff)
  @ApiOkResponse({ type: PageDto(StaffDto) })
  findPageByCinema(@Param('cinemaId') cinemaId: string, @Query() query: ListStaffQueryDto): Promise<IPage<StaffDto>> {
    return this.staff.findPageByCinema(cinemaId, query);
  }

  @Post('staff')
  @Auth(Permission.ManageStaff)
  @ApiCreatedResponse({ type: StaffDto })
  @ApiConflictResponse()
  create(@CurrentStaff() actor: StaffUser, @Body() dto: CreateStaffDto): Promise<StaffDto> {
    return this.staff.create(actor, dto);
  }

  @Patch('staff/:id')
  @Auth(Permission.ManageStaff)
  @ApiOkResponse({ type: StaffDto })
  @ApiNotFoundResponse()
  update(@CurrentStaff() actor: StaffUser, @Param('id', ParseIdPipe) id: string, @Body() dto: UpdateStaffDto): Promise<StaffDto> {
    return this.staff.update(actor, id, dto);
  }
}
