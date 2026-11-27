import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, type FindOptionsWhere, In, LessThan, MoreThan, MoreThanOrEqual, Not, type Repository } from 'typeorm';
import { containsIgnoringCase } from '@/common/pagination/page.js';
import { addDays, MIDNIGHT, MINUTE_MS, todayIn, toUtc } from '@/common/time/zoned-time.js';
import type { CatalogHallsDto } from '@/modules/catalog/dto/catalog-hall.dto.js';
import type { CatalogSessionDto } from '@/modules/catalog/dto/catalog-session.dto.js';
import type { ListCatalogFilmsQueryDto } from '@/modules/catalog/dto/list-catalog-films-query.dto.js';
import type { ListCatalogSessionsQueryDto } from '@/modules/catalog/dto/list-catalog-sessions-query.dto.js';
import { CATALOG_MESSAGES, ONLINE_SALE_CLOSES_BEFORE_MINUTES, SCHEDULE_DAYS } from '@/modules/catalog/catalog.constant.js';
import { Cinema, DEFAULT_TIMEZONE } from '@/modules/cinemas/entities/cinema.entity.js';
import { Film } from '@/modules/films/entities/film.entity.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import { HallLayout } from '@/modules/halls/entities/hall-layout.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { calculateHallSeatPrice, calculateSessionSeatPrice } from '@/modules/sessions/session-price.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';

interface ISaleWindow {
  from: Date;
  to: Date;
}

const latest = (first: Date, second: Date): Date => (first > second ? first : second);
const earliest = (first: Date, second: Date): Date => (first < second ? first : second);

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>,
    @InjectRepository(Film) private readonly films: Repository<Film>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Hall) private readonly halls: Repository<Hall>,
    @InjectRepository(HallLayout) private readonly layouts: Repository<HallLayout>,
    @InjectRepository(Seat) private readonly seats: Repository<Seat>,
    @InjectRepository(TimeBand) private readonly timeBands: Repository<TimeBand>,
  ) {}

  findCinemas(): Promise<Cinema[]> {
    return this.cinemas.find({ where: { isPublished: true }, order: { name: 'ASC', id: 'ASC' } });
  }

  async findFilms(cinemaId: string, { search }: ListCatalogFilmsQueryDto): Promise<Film[]> {
    const cinema = await this.#findCinema(cinemaId);
    const sessions = await this.#findOnSale(cinema, search ? { film: { title: containsIgnoringCase(search) } } : {});
    const films = new Map(sessions.map(({ film }) => [film.id, film]));

    return [...films.values()].toSorted((first, second) => first.title.localeCompare(second.title, 'ru'));
  }

  async findSessions(cinemaId: string, { date, filmId, hallId }: ListCatalogSessionsQueryDto): Promise<CatalogSessionDto[]> {
    const cinema = await this.#findCinema(cinemaId);
    const sessions = await this.#findOnSale(cinema, { ...(filmId && { filmId }), ...(hallId && { hallId }) }, date);
    if (sessions.length === 0) return [];

    const [bands, zoneMultipliers] = await Promise.all([
      this.timeBands.findBy({ cinemaId }),
      this.#findCheapestZoneMultipliers(sessions.map(({ layoutId }) => layoutId)),
    ]);

    return sessions.map((session) =>
      Object.assign(session, { minPrice: calculateSessionSeatPrice(session, bands, cinema.timezone, zoneMultipliers.get(session.layoutId) ?? 1) }),
    );
  }

  async findHalls(cinemaId: string): Promise<CatalogHallsDto> {
    await this.#findCinema(cinemaId);
    const [timeBands, halls] = await Promise.all([
      this.timeBands.find({ where: { cinemaId }, order: { startsAt: 'ASC' } }),
      this.halls.find({ where: { cinemaId, isActive: true }, relations: { priceZones: true }, order: { name: 'ASC', id: 'ASC' } }),
    ]);
    const layouts = await this.layouts.find({
      where: { hallId: In(halls.map(({ id }) => id)), isCurrent: true },
      relations: { seats: true },
      order: { seats: { posY: 'ASC', posX: 'ASC' } },
    });
    const layoutByHall = new Map(layouts.map((layout) => [layout.hallId, layout]));

    return {
      timeBands,
      halls: halls.flatMap((hall) => {
        const { id, name, format, priceZones } = hall;
        const layout = layoutByHall.get(id);
        if (!layout) return [];
        const usedZoneIds = new Set(layout.seats.map(({ priceZoneId }) => priceZoneId));

        return {
          id,
          name,
          format,
          seats: layout.seats.map(({ row, number, posX, posY, type, priceZoneId }) => ({ row, number, posX, posY, type, priceZoneId })),
          priceZones: priceZones
            .filter((zone) => usedZoneIds.has(zone.id))
            .toSorted((first, second) => first.multiplier - second.multiplier)
            .map((zone) => ({
              id: zone.id,
              name: zone.name,
              multiplier: zone.multiplier,
              prices: timeBands.map((band) => calculateHallSeatPrice(hall, band.multiplier, zone.multiplier)),
            })),
        };
      }),
    };
  }

  async findFilm(id: string): Promise<Film> {
    const film = await this.films.findOneBy({ id, status: Not(FilmStatus.Archived) });
    if (!film) throw new NotFoundException(CATALOG_MESSAGES.filmNotFound);

    return film;
  }

  async findComingSoon(): Promise<Film[]> {
    const scheduled = await this.sessions.find({ select: { filmId: true }, where: { status: SessionStatus.Scheduled, startsAt: MoreThan(new Date()) } });
    const scheduledFilmIds = new Set(scheduled.map(({ filmId }) => filmId));
    const announced = await this.films.find({
      where: { status: Not(FilmStatus.Archived), releaseDate: MoreThan(todayIn(DEFAULT_TIMEZONE)) },
      order: { releaseDate: 'ASC', title: 'ASC', id: 'ASC' },
    });

    return announced.filter(({ id }) => !scheduledFilmIds.has(id));
  }

  async #findCinema(id: string): Promise<Cinema> {
    const cinema = await this.cinemas.findOneBy({ id, isPublished: true });
    if (!cinema) throw new NotFoundException(CATALOG_MESSAGES.cinemaNotFound);

    return cinema;
  }

  #findOnSale(cinema: Cinema, filters: FindOptionsWhere<Session>, date?: string): Promise<Session[]> {
    const { from, to } = this.#saleWindow(cinema, date);

    return this.sessions.find({
      where: { ...filters, hall: { cinemaId: cinema.id }, status: SessionStatus.Scheduled, startsAt: And(MoreThanOrEqual(from), LessThan(to)) },
      relations: { film: true, hall: true },
      order: { startsAt: 'ASC', id: 'ASC' },
    });
  }

  #saleWindow({ timezone }: Cinema, date?: string): ISaleWindow {
    const saleOpen = new Date(Date.now() + ONLINE_SALE_CLOSES_BEFORE_MINUTES * MINUTE_MS);
    const scheduleEnd = toUtc(addDays(todayIn(timezone), SCHEDULE_DAYS), MIDNIGHT, timezone);
    if (!date) return { from: saleOpen, to: scheduleEnd };

    return { from: latest(saleOpen, toUtc(date, MIDNIGHT, timezone)), to: earliest(scheduleEnd, toUtc(addDays(date, 1), MIDNIGHT, timezone)) };
  }

  async #findCheapestZoneMultipliers(layoutIds: string[]): Promise<Map<string, number>> {
    const rows = await this.seats
      .createQueryBuilder('seat')
      .innerJoin('seat.priceZone', 'priceZone')
      .select('seat.layoutId', 'layoutId')
      .addSelect('MIN(priceZone.multiplier)', 'multiplier')
      .where({ layoutId: In([...new Set(layoutIds)]) })
      .groupBy('seat.layoutId')
      .getRawMany<{ layoutId: string; multiplier: string }>();

    return new Map(rows.map(({ layoutId, multiplier }) => [layoutId, Number(multiplier)]));
  }
}
