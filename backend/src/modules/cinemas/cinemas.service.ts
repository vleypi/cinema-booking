import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { rethrowUniqueViolation } from '@/common/database/unique-violation.js';
import { CINEMA_MESSAGES } from '@/modules/cinemas/cinemas.constant.js';
import type { CreateCinemaDto } from '@/modules/cinemas/dto/create-cinema.dto.js';
import type { UpdateCinemaDto } from '@/modules/cinemas/dto/update-cinema.dto.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';
import { buildTimeBands } from '@/modules/time-bands/time-band-schedule.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';

@Injectable()
export class CinemasService {
  constructor(@InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>) {}

  findAll(): Promise<Cinema[]> {
    return this.cinemas.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateCinemaDto): Promise<Cinema> {
    const { id } = await this.cinemas.manager
      .transaction(async (manager) => {
        const cinema = await manager.save(manager.create(Cinema, dto));
        await manager.insert(TimeBand, buildTimeBands(cinema.id, DEFAULT_TIME_BANDS));

        return cinema;
      })
      .catch(rethrowUniqueViolation('slug', CINEMA_MESSAGES.slugTaken));

    return this.#findOne(id);
  }

  async update(id: string, dto: UpdateCinemaDto): Promise<Cinema> {
    const cinema = await this.#findOne(id);
    await this.cinemas.save(this.cinemas.merge(cinema, dto)).catch(rethrowUniqueViolation('slug', CINEMA_MESSAGES.slugTaken));

    return this.#findOne(id);
  }

  async #findOne(id: string): Promise<Cinema> {
    const cinema = await this.cinemas.findOneBy({ id });
    if (!cinema) throw new NotFoundException(CINEMA_MESSAGES.notFound);

    return cinema;
  }
}
