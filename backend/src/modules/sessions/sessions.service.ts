import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, type EntityManager, LessThan, MoreThan, MoreThanOrEqual, type Repository } from 'typeorm';
import { addDays, formatTime, MIDNIGHT, MINUTE_MS, toUtc } from '@/common/time/zoned-time.js';
import { invalidField } from '@/common/validation/validation-errors.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { canAccessCinema } from '@/modules/auth/permissions.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { Film } from '@/modules/films/entities/film.entity.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import { HallLayout } from '@/modules/halls/entities/hall-layout.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import type { CreateSessionDto } from '@/modules/sessions/dto/create-session.dto.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { fitsOpeningHours } from '@/modules/sessions/session-schedule.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { SESSION_MESSAGES } from '@/modules/sessions/sessions.constant.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>,
    @InjectRepository(Film) private readonly films: Repository<Film>,
  ) {}

  async findByCinemaDay(cinemaId: string, date: string): Promise<Session[]> {
    const { timezone } = await this.cinemas.findOneByOrFail({ id: cinemaId });
    const dayStart = toUtc(date, MIDNIGHT, timezone);
    const nextDayStart = toUtc(addDays(date, 1), MIDNIGHT, timezone);

    return this.sessions.find({
      where: { hall: { cinemaId }, startsAt: And(MoreThanOrEqual(dayStart), LessThan(nextDayStart)) },
      relations: { film: true },
      order: { startsAt: 'ASC' },
    });
  }

  async create(cinemaId: string, { filmId, hallId, date, time, format, basePriceOverride }: CreateSessionDto): Promise<Session> {
    const cinema = await this.cinemas.findOneByOrFail({ id: cinemaId });
    const film = await this.films.findOneBy({ id: filmId });
    if (!film || film.status === FilmStatus.Archived) throw invalidField('filmId', SESSION_MESSAGES.filmUnavailable);

    const startsAt = toUtc(date, time, cinema.timezone);
    const endsAt = new Date(startsAt.getTime() + film.durationMinutes * MINUTE_MS);
    if (startsAt.getTime() <= Date.now()) throw invalidField('time', SESSION_MESSAGES.inPast);
    if (!fitsOpeningHours(time, film.durationMinutes, cinema)) {
      throw invalidField('time', SESSION_MESSAGES.outsideOpeningHours(cinema.opensAt, cinema.closesAt));
    }

    const sessionId = await this.sessions.manager.transaction(async (manager) => {
      const hall = await manager.findOne(Hall, { where: { id: hallId, cinemaId, isActive: true }, lock: { mode: 'pessimistic_write' } });
      if (!hall) throw invalidField('hallId', SESSION_MESSAGES.hallUnavailable);
      const layout = await manager.findOneBy(HallLayout, { hallId, isCurrent: true });
      if (!layout) throw invalidField('hallId', SESSION_MESSAGES.hallWithoutLayout);
      await this.#assertHallIsFree(manager, cinema, hallId, startsAt, endsAt);

      const { id } = await manager.save(
        manager.create(Session, { filmId, hallId, layoutId: layout.id, startsAt, endsAt, format, basePriceOverride: basePriceOverride ?? null }),
      );
      return id;
    });

    return this.sessions.findOneOrFail({ where: { id: sessionId }, relations: { film: true } });
  }

  async remove(actor: StaffUser, id: string): Promise<void> {
    const session = await this.sessions.findOne({ where: { id }, relations: { hall: true } });
    if (!session) throw new NotFoundException(SESSION_MESSAGES.notFound);
    if (!canAccessCinema(actor, session.hall.cinemaId)) throw new ForbiddenException(AUTH_MESSAGES.cinemaAccessDenied);

    await this.sessions.delete({ id });
  }

  async #assertHallIsFree(manager: EntityManager, cinema: Cinema, hallId: string, startsAt: Date, endsAt: Date): Promise<void> {
    const breakMs = cinema.cleaningBreakMinutes * MINUTE_MS;
    const conflict = await manager.findOne(Session, {
      where: {
        hallId,
        status: SessionStatus.Scheduled,
        startsAt: LessThan(new Date(endsAt.getTime() + breakMs)),
        endsAt: MoreThan(new Date(startsAt.getTime() - breakMs)),
      },
      relations: { film: true },
    });
    if (!conflict) return;

    const [conflictStart, conflictEnd] = [conflict.startsAt, conflict.endsAt].map((instant) => formatTime(instant, cinema.timezone));
    throw invalidField('time', SESSION_MESSAGES.hallBusy(conflict.film.title, conflictStart, conflictEnd, cinema.cleaningBreakMinutes));
  }
}
