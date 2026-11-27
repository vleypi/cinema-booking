import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { CatalogService } from '@/modules/catalog/catalog.service.js';
import { CatalogCinemaDto } from '@/modules/catalog/dto/catalog-cinema.dto.js';
import { CatalogHallsDto } from '@/modules/catalog/dto/catalog-hall.dto.js';
import { CatalogSessionDto } from '@/modules/catalog/dto/catalog-session.dto.js';
import { ListCatalogFilmsQueryDto } from '@/modules/catalog/dto/list-catalog-films-query.dto.js';
import { ListCatalogSessionsQueryDto } from '@/modules/catalog/dto/list-catalog-sessions-query.dto.js';
import { FilmDto } from '@/modules/films/dto/film.dto.js';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('cinemas')
  @ApiOkResponse({ type: [CatalogCinemaDto], description: 'Опубликованные кинотеатры сети' })
  findCinemas(): Promise<CatalogCinemaDto[]> {
    return this.catalog.findCinemas();
  }

  @Get('cinemas/:cinemaId/films')
  @ApiOkResponse({ type: [FilmDto], description: 'Фильмы с открытой онлайн-продажей на ближайшие семь дней' })
  @ApiNotFoundResponse()
  findFilms(@Param('cinemaId', ParseIdPipe) cinemaId: string, @Query() query: ListCatalogFilmsQueryDto): Promise<FilmDto[]> {
    return this.catalog.findFilms(cinemaId, query);
  }

  @Get('cinemas/:cinemaId/sessions')
  @ApiOkResponse({ type: [CatalogSessionDto], description: 'Сеансы с открытой онлайн-продажей, без даты на ближайшие семь дней' })
  @ApiNotFoundResponse()
  findSessions(@Param('cinemaId', ParseIdPipe) cinemaId: string, @Query() query: ListCatalogSessionsQueryDto): Promise<CatalogSessionDto[]> {
    return this.catalog.findSessions(cinemaId, query);
  }

  @Get('cinemas/:cinemaId/halls')
  @ApiOkResponse({ type: CatalogHallsDto, description: 'Открытые залы со схемой мест и ценами по временным интервалам' })
  @ApiNotFoundResponse()
  findHalls(@Param('cinemaId', ParseIdPipe) cinemaId: string): Promise<CatalogHallsDto> {
    return this.catalog.findHalls(cinemaId);
  }

  @Get('films/coming-soon')
  @ApiOkResponse({ type: [FilmDto], description: 'Фильмы с премьерой в будущем и без сеансов' })
  findComingSoon(): Promise<FilmDto[]> {
    return this.catalog.findComingSoon();
  }

  @Get('films/:id')
  @ApiOkResponse({ type: FilmDto })
  @ApiNotFoundResponse()
  findFilm(@Param('id', ParseIdPipe) id: string): Promise<FilmDto> {
    return this.catalog.findFilm(id);
  }
}
