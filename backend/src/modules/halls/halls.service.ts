import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOneOptions, Repository } from 'typeorm';
import { VALIDATION_FAILED_MESSAGE } from '@/common/validation/validation-errors.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { canAccessCinema } from '@/modules/auth/permissions.js';
import type { CreateHallLayoutDto } from '@/modules/halls/dto/create-hall-layout.dto.js';
import type { CreateHallDto } from '@/modules/halls/dto/create-hall.dto.js';
import type { CreatePriceZoneDto } from '@/modules/halls/dto/create-price-zone.dto.js';
import type { UpdateHallDto } from '@/modules/halls/dto/update-hall.dto.js';
import type { UpdatePriceZoneDto } from '@/modules/halls/dto/update-price-zone.dto.js';
import { HallLayout } from '@/modules/halls/entities/hall-layout.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { PriceZone } from '@/modules/halls/entities/price-zone.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { findLayoutErrors } from '@/modules/halls/hall-layout.validation.js';
import { HALL_MESSAGES } from '@/modules/halls/halls.constant.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';

const WITH_SEATS = { relations: { seats: true }, order: { seats: { row: 'ASC', number: 'ASC' } } } satisfies FindOneOptions<HallLayout>;

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall) private readonly halls: Repository<Hall>,
    @InjectRepository(PriceZone) private readonly priceZones: Repository<PriceZone>,
    @InjectRepository(HallLayout) private readonly layouts: Repository<HallLayout>,
    @InjectRepository(Seat) private readonly seats: Repository<Seat>,
  ) {}

  findByCinema(cinemaId: string): Promise<Hall[]> {
    return this.halls.find({ where: { cinemaId }, relations: { priceZones: true }, order: { name: 'ASC', priceZones: { id: 'ASC' } } });
  }

  async create(cinemaId: string, dto: CreateHallDto): Promise<Hall> {
    const { id } = await this.halls.save(Object.assign(this.halls.create(dto), { cinemaId }));

    return this.#findHall(id);
  }

  async update(actor: StaffUser, id: string, dto: UpdateHallDto): Promise<Hall> {
    const hall = await this.#findAccessibleHall(actor, id);
    await this.halls.save(this.halls.merge(hall, dto));

    return this.#findHall(id);
  }

  async createPriceZone(actor: StaffUser, hallId: string, dto: CreatePriceZoneDto): Promise<PriceZone> {
    await this.#findAccessibleHall(actor, hallId);

    return this.priceZones.save(Object.assign(this.priceZones.create(dto), { hallId }));
  }

  async updatePriceZone(actor: StaffUser, id: string, dto: UpdatePriceZoneDto): Promise<PriceZone> {
    const priceZone = await this.#findAccessiblePriceZone(actor, id);
    await this.priceZones.save(this.priceZones.merge(priceZone, dto));

    return this.priceZones.findOneByOrFail({ id });
  }

  async removePriceZone(actor: StaffUser, id: string): Promise<void> {
    await this.#findAccessiblePriceZone(actor, id);
    if (await this.seats.existsBy({ priceZoneId: id })) throw new ConflictException(HALL_MESSAGES.priceZoneInUse);

    await this.priceZones.delete({ id });
  }

  async findCurrentLayout(actor: StaffUser, hallId: string): Promise<HallLayout> {
    await this.#findAccessibleHall(actor, hallId);
    const layout = await this.layouts.findOne({ where: { hallId, isCurrent: true }, ...WITH_SEATS });
    if (!layout) throw new NotFoundException(HALL_MESSAGES.layoutNotFound);

    return layout;
  }

  async createLayout(actor: StaffUser, hallId: string, dto: CreateHallLayoutDto): Promise<HallLayout> {
    const hall = await this.#findAccessibleHall(actor, hallId);
    const errors = findLayoutErrors(dto, hall.priceZones.map(({ id }) => id));
    if (Object.keys(errors).length > 0) throw new BadRequestException({ message: VALIDATION_FAILED_MESSAGE, errors });

    const layoutId = await this.layouts.manager.transaction(async (manager) => {
      const latest = await manager.findOne(HallLayout, { where: { hallId }, order: { version: 'DESC' }, select: { version: true } });
      await manager.update(HallLayout, { hallId, isCurrent: true }, { isCurrent: false });
      const { id } = await manager.save(manager.create(HallLayout, { hallId, rows: dto.rows, version: (latest?.version ?? 0) + 1, isCurrent: true }));
      await manager.insert(
        Seat,
        dto.seats.map(({ row, number, posX, posY, type, priceZoneId }) => ({ layoutId: id, row, number, posX, posY, type, priceZoneId })),
      );

      return id;
    });

    return this.layouts.findOneOrFail({ where: { id: layoutId }, ...WITH_SEATS });
  }

  async #findHall(id: string): Promise<Hall> {
    const hall = await this.halls.findOne({ where: { id }, relations: { priceZones: true }, order: { priceZones: { id: 'ASC' } } });
    if (!hall) throw new NotFoundException(HALL_MESSAGES.notFound);

    return hall;
  }

  async #findAccessibleHall(actor: StaffUser, id: string): Promise<Hall> {
    const hall = await this.#findHall(id);
    this.#assertCinemaAccess(actor, hall.cinemaId);

    return hall;
  }

  async #findAccessiblePriceZone(actor: StaffUser, id: string): Promise<PriceZone> {
    const priceZone = await this.priceZones.findOne({ where: { id }, relations: { hall: true } });
    if (!priceZone) throw new NotFoundException(HALL_MESSAGES.priceZoneNotFound);
    this.#assertCinemaAccess(actor, priceZone.hall.cinemaId);

    return priceZone;
  }

  #assertCinemaAccess(actor: StaffUser, cinemaId: string): void {
    if (!canAccessCinema(actor, cinemaId)) throw new ForbiddenException(AUTH_MESSAGES.cinemaAccessDenied);
  }
}
