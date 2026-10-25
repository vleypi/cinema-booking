import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsOrder, In, type Repository } from 'typeorm';
import { SortOrder } from '@/common/pagination/list-query.dto.js';
import { containsIgnoringCase, type IPage, toPageWindow, toSqlDirection } from '@/common/pagination/page.js';
import type { CreateFilmDto } from '@/modules/films/dto/create-film.dto.js';
import { FilmSortField, type ListFilmsQueryDto } from '@/modules/films/dto/list-films-query.dto.js';
import type { UpdateFilmDto } from '@/modules/films/dto/update-film.dto.js';
import { Film } from '@/modules/films/entities/film.entity.js';
import { FILM_MESSAGES } from '@/modules/films/films.constant.js';
import { type IUploadedFile, MediaService } from '@/modules/media/media.service.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';

const NEWEST_FIRST: FindOptionsOrder<Film> = { releaseDate: 'DESC', title: 'ASC', id: 'ASC' };

const FILM_ORDER: Record<FilmSortField, (direction: 'ASC' | 'DESC') => FindOptionsOrder<Film>> = {
  [FilmSortField.Title]: (direction) => ({ title: direction, id: 'ASC' }),
  [FilmSortField.ReleaseDate]: (direction) => ({ releaseDate: direction, title: 'ASC', id: 'ASC' }),
  [FilmSortField.Status]: (direction) => ({ status: direction, title: 'ASC', id: 'ASC' }),
};

@Injectable()
export class FilmsService {
  constructor(
    private readonly media: MediaService,
    @InjectRepository(Film) private readonly films: Repository<Film>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
  ) {}

  async findPage(query: ListFilmsQueryDto): Promise<IPage<Film>> {
    const { search, status, sort, order = SortOrder.Asc } = query;
    const [items, total] = await this.films.findAndCount({
      where: { ...(search && { title: containsIgnoringCase(search) }), ...(status && { status: In(status) }) },
      order: sort ? FILM_ORDER[sort](toSqlDirection(order)) : NEWEST_FIRST,
      ...toPageWindow(query),
    });

    return { items, total };
  }

  async create(dto: CreateFilmDto): Promise<Film> {
    const { id } = await this.films.save(this.films.create(dto));

    return this.#findOne(id);
  }

  async update(id: string, dto: UpdateFilmDto): Promise<Film> {
    const film = await this.#findOne(id);
    await this.films.save(this.films.merge(film, dto));

    return this.#findOne(id);
  }

  async remove(id: string): Promise<void> {
    const { posterFileId } = await this.#findOne(id);
    if (await this.sessions.existsBy({ filmId: id })) throw new ConflictException(FILM_MESSAGES.hasSessions);

    await this.films.delete({ id });
    if (posterFileId) await this.media.remove(posterFileId);
  }

  async replacePoster(id: string, file: IUploadedFile): Promise<Film> {
    const { posterFileId: previousPosterId } = await this.#findOne(id);
    const poster = await this.media.save(file);

    await this.films.update({ id }, { posterFileId: poster.id });
    if (previousPosterId) await this.media.remove(previousPosterId);

    return this.#findOne(id);
  }

  async #findOne(id: string): Promise<Film> {
    const film = await this.films.findOneBy({ id });
    if (!film) throw new NotFoundException(FILM_MESSAGES.notFound);

    return film;
  }
}
