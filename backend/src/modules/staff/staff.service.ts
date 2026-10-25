import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsOrder, In, type Repository } from 'typeorm';
import { rethrowUniqueViolation } from '@/common/database/unique-violation.js';
import { SortOrder } from '@/common/pagination/list-query.dto.js';
import { containsIgnoringCase, type IPage, toPageWindow, toSqlDirection } from '@/common/pagination/page.js';
import { hashPassword } from '@/common/security/password.js';
import { invalidField } from '@/common/validation/validation-errors.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { canAccessCinema, canAccessStaff, canManageRole } from '@/modules/auth/permissions.js';
import { CINEMA_MESSAGES } from '@/modules/cinemas/cinemas.constant.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import type { CreateStaffDto } from '@/modules/staff/dto/create-staff.dto.js';
import { type ListStaffQueryDto, StaffSortField } from '@/modules/staff/dto/list-staff-query.dto.js';
import { type StaffDto, toStaffDto } from '@/modules/staff/dto/staff.dto.js';
import type { UpdateStaffDto } from '@/modules/staff/dto/update-staff.dto.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { STAFF_MESSAGES } from '@/modules/staff/staff.constant.js';
import type { StaffRole } from '@/modules/staff/staff-role.enum.js';

const STAFF_ORDER: Record<StaffSortField, (direction: 'ASC' | 'DESC') => FindOptionsOrder<StaffUser>> = {
  [StaffSortField.FullName]: (direction) => ({ fullName: direction, id: 'ASC' }),
  [StaffSortField.Role]: (direction) => ({ role: direction, fullName: 'ASC', id: 'ASC' }),
  [StaffSortField.Status]: (direction) => ({ isBlocked: direction, mustChangePassword: direction, fullName: 'ASC', id: 'ASC' }),
};

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffUser) private readonly staffUsers: Repository<StaffUser>,
    @InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>,
  ) {}

  async findPageByCinema(cinemaId: string, query: ListStaffQueryDto): Promise<IPage<StaffDto>> {
    const { search, sort = StaffSortField.FullName, order = SortOrder.Asc } = query;
    const inCinema = { cinemas: { id: cinemaId } };
    const pattern = search ? containsIgnoringCase(search) : undefined;
    const staffOrder = STAFF_ORDER[sort](toSqlDirection(order));
    const [members, total] = await this.staffUsers.findAndCount({
      where: pattern ? [{ ...inCinema, fullName: pattern }, { ...inCinema, login: pattern }] : inCinema,
      order: staffOrder,
      ...toPageWindow(query),
    });
    const staff = await this.staffUsers.find({ where: { id: In(members.map(({ id }) => id)) }, relations: { cinemas: true }, order: staffOrder });

    return { items: staff.map(toStaffDto), total };
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
    if (cinemas.length !== cinemaIds.length) throw invalidField('cinemaIds', CINEMA_MESSAGES.notFound);

    return cinemas;
  }

  async #findOne(id: string): Promise<StaffUser> {
    const staff = await this.staffUsers.findOne({ where: { id }, relations: { cinemas: true } });
    if (!staff) throw new NotFoundException(STAFF_MESSAGES.notFound);

    return staff;
  }
}
