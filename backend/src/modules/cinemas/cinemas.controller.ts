import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { type IPage, PageDto } from '@/common/pagination/page.js';
import { Auth } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { CinemasService } from '@/modules/cinemas/cinemas.service.js';
import { CinemaDto } from '@/modules/cinemas/dto/cinema.dto.js';
import { CreateCinemaDto } from '@/modules/cinemas/dto/create-cinema.dto.js';
import { ListCinemasQueryDto } from '@/modules/cinemas/dto/list-cinemas-query.dto.js';
import { UpdateCinemaDto } from '@/modules/cinemas/dto/update-cinema.dto.js';

@ApiTags('cinemas')
@Controller('cinemas')
export class CinemasController {
  constructor(private readonly cinemas: CinemasService) {}

  @Get()
  @Auth(Permission.ManageCinemas)
  @ApiOkResponse({ type: PageDto(CinemaDto) })
  findPage(@Query() query: ListCinemasQueryDto): Promise<IPage<CinemaDto>> {
    return this.cinemas.findPage(query);
  }

  @Post()
  @Auth(Permission.ManageCinemas)
  @ApiCreatedResponse({ type: CinemaDto })
  @ApiConflictResponse()
  create(@Body() dto: CreateCinemaDto): Promise<CinemaDto> {
    return this.cinemas.create(dto);
  }

  @Patch(':cinemaId')
  @Auth(Permission.ManageCinemas)
  @ApiOkResponse({ type: CinemaDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  update(@Param('cinemaId') cinemaId: string, @Body() dto: UpdateCinemaDto): Promise<CinemaDto> {
    return this.cinemas.update(cinemaId, dto);
  }
}
