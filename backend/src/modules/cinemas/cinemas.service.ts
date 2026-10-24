import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { rethrowUniqueViolation } from '@/common/database/unique-violation.js';
import { CINEMA_MESSAGES } from '@/modules/cinemas/cinemas.constant.js';
import type { CreateCinemaDto } from '@/modules/cinemas/dto/create-cinema.dto.js';
import type { UpdateCinemaDto } from '@/modules/cinemas/dto/update-cinema.dto.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';

@Injectable()
export class CinemasService {
  constructor(@InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>) {}

  findAll(): Promise<Cinema[]> {
    return this.cinemas.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateCinemaDto): Promise<Cinema> {
    const { id } = await this.cinemas.save(this.cinemas.create(dto)).catch(rethrowUniqueViolation('slug', CINEMA_MESSAGES.slugTaken));

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
