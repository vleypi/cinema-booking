import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { ReplaceTimeBandsDto } from '@/modules/time-bands/dto/replace-time-bands.dto.js';
import { TimeBandDto } from '@/modules/time-bands/dto/time-band.dto.js';
import { TimeBandsService } from '@/modules/time-bands/time-bands.service.js';

@ApiTags('time-bands')
@Controller('cinemas/:cinemaId/time-bands')
export class TimeBandsController {
  constructor(private readonly timeBands: TimeBandsService) {}

  @Get()
  @Auth(Permission.ManageHalls)
  @ApiOkResponse({ type: [TimeBandDto] })
  findByCinema(@Param('cinemaId') cinemaId: string): Promise<TimeBandDto[]> {
    return this.timeBands.findByCinema(cinemaId);
  }

  @Put()
  @Auth(Permission.ManageHalls)
  @ApiOkResponse({ type: [TimeBandDto] })
  replace(@Param('cinemaId') cinemaId: string, @Body() dto: ReplaceTimeBandsDto): Promise<TimeBandDto[]> {
    return this.timeBands.replace(cinemaId, dto);
  }
}
