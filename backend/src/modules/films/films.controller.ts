import { Body, Controller, Delete, FileTypeValidator, Get, HttpCode, HttpStatus, Param, ParseFilePipe, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiPayloadTooLargeResponse,
  ApiTags,
} from '@nestjs/swagger';
import { type IPage, PageDto } from '@/common/pagination/page.js';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { invalidField } from '@/common/validation/validation-errors.js';
import { Auth } from '@/modules/auth/auth.decorator.js';
import { Permission } from '@/modules/auth/permissions.js';
import { CreateFilmDto } from '@/modules/films/dto/create-film.dto.js';
import { FilmDto } from '@/modules/films/dto/film.dto.js';
import { ListFilmsQueryDto } from '@/modules/films/dto/list-films-query.dto.js';
import { UpdateFilmDto } from '@/modules/films/dto/update-film.dto.js';
import { FILM_MESSAGES, POSTER_FIELD, POSTER_MAX_BYTES, POSTER_MIME_TYPES } from '@/modules/films/films.constant.js';
import { FilmsService } from '@/modules/films/films.service.js';
import type { IUploadedFile } from '@/modules/media/media.service.js';

const posterPipe = new ParseFilePipe({
  validators: [new FileTypeValidator({ fileType: POSTER_MIME_TYPES, overrideMimeType: true })],
  exceptionFactory: () => invalidField(POSTER_FIELD, FILM_MESSAGES.invalidPoster),
});

@ApiTags('films')
@Controller('films')
export class FilmsController {
  constructor(private readonly films: FilmsService) {}

  @Get()
  @Auth(Permission.ManageFilms)
  @ApiOkResponse({ type: PageDto(FilmDto) })
  findPage(@Query() query: ListFilmsQueryDto): Promise<IPage<FilmDto>> {
    return this.films.findPage(query);
  }

  @Post()
  @Auth(Permission.ManageFilms)
  @ApiCreatedResponse({ type: FilmDto })
  create(@Body() dto: CreateFilmDto): Promise<FilmDto> {
    return this.films.create(dto);
  }

  @Patch(':id')
  @Auth(Permission.ManageFilms)
  @ApiOkResponse({ type: FilmDto })
  @ApiNotFoundResponse()
  update(@Param('id', ParseIdPipe) id: string, @Body() dto: UpdateFilmDto): Promise<FilmDto> {
    return this.films.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(Permission.ManageFilms)
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  remove(@Param('id', ParseIdPipe) id: string): Promise<void> {
    return this.films.remove(id);
  }

  @Put(':id/poster')
  @Auth(Permission.ManageFilms)
  @UseInterceptors(FileInterceptor(POSTER_FIELD, { limits: { fileSize: POSTER_MAX_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: [POSTER_FIELD], properties: { [POSTER_FIELD]: { type: 'string', format: 'binary' } } } })
  @ApiOkResponse({ type: FilmDto })
  @ApiNotFoundResponse()
  @ApiPayloadTooLargeResponse()
  replacePoster(@Param('id', ParseIdPipe) id: string, @UploadedFile(posterPipe) file: IUploadedFile): Promise<FilmDto> {
    return this.films.replacePoster(id, file);
  }
}
