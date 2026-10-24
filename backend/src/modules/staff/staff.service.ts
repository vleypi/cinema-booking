import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type Repository } from 'typeorm';
import { rethrowUniqueViolation } from '@/common/database/unique-violation.js';
import { hashPassword } from '@/common/security/password.js';
import { fieldError } from '@/common/validation/validation-errors.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { canAccessCinema, canAccessStaff, canManageRole } from '@/modules/auth/permissions.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import type { CreateStaffDto } from '@/modules/staff/dto/create-staff.dto.js';
import { type StaffDto, toStaffDto } from '@/modules/staff/dto/staff.dto.js';
import type { UpdateStaffDto } from '@/modules/staff/dto/update-staff.dto.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { STAFF_MESSAGES } from '@/modules/staff/staff.constant.js';
import type { StaffRole } from '@/modules/staff/staff-role.enum.js';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffUser) private readonly staffUsers: Repository<StaffUser>,
    @InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>,
  ) {}

  async findByCinema(cinemaId: string): Promise<StaffDto[]> {
    const members = await this.staffUsers.find({ select: { id: true }, where: { cinemas: { id: cinemaId } } });
    const staff = await this.staffUsers.find({
      where: { id: In(members.map(({ id }) => id)) },
      relations: { cinemas: true },
      order: { fullName: 'ASC' },
    });

    return staff.map(toStaffDto);
  }

  async create(actor: StaffUser, { password, cinemaIds, ...dto }: CreateStaffDto): Promise<StaffDto> {
    this.#assertCanManageRole(actor, dto.role);
    const cinemas = await this.#findAccessibleCinemas(actor, cinemaIds);

    const { id } = await this.staffUsers
      .save({ ...dto, cinemas, passwordHash: await hashPassword(password), mustChangePassword: true })
      .catch(rethrowUniqueViolation('login', STAFF_MESSAGES.loginTaken));

    return toStaffDto(await this.#findOne(id));
  }

  async update(actor: StaffUser, id: string, { password, cinemaIds, ...changes }: UpdateStaffDto): Promise<StaffDto> {
    const staff = await this.#findOne(id);
    if (!canAccessStaff(actor, staff)) throw new ForbiddenException(AUTH_MESSAGES.permissionDenied);
    this.#assertCanManageRole(actor, staff.role);
    if (changes.role) this.#assertCanManageRole(actor, changes.role);

    const cinemas = cinemaIds
      ? [...staff.cinemas.filter((cinema) => !canAccessCinema(actor, cinema.id)), ...(await this.#findAccessibleCinemas(actor, cinemaIds))]
      : staff.cinemas;
    const passwordReset = password ? { passwordHash: await hashPassword(password), mustChangePassword: true } : {};

    this.staffUsers.merge(staff, changes, passwordReset);
    staff.cinemas = cinemas;
    await this.staffUsers.save(staff);

    return toStaffDto(await this.#findOne(id));
  }

  #assertCanManageRole(actor: StaffUser, role: StaffRole): void {
    if (!canManageRole(actor, role)) throw new ForbiddenException(AUTH_MESSAGES.permissionDenied);
  }

  async #findAccessibleCinemas(actor: StaffUser, cinemaIds: string[]): Promise<Cinema[]> {
    if (!cinemaIds.every((cinemaId) => canAccessCinema(actor, cinemaId))) throw new ForbiddenException(AUTH_MESSAGES.cinemaAccessDenied);

    const cinemas = await this.cinemas.findBy({ id: In(cinemaIds) });
    if (cinemas.length !== cinemaIds.length) throw new BadRequestException(fieldError('cinemaIds', STAFF_MESSAGES.cinemaNotFound));

    return cinemas;
  }

  async #findOne(id: string): Promise<StaffUser> {
    const staff = await this.staffUsers.findOne({ where: { id }, relations: { cinemas: true } });
    if (!staff) throw new NotFoundException(STAFF_MESSAGES.notFound);

    return staff;
  }
}
