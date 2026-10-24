import { createHash, randomBytes } from 'node:crypto';
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, type Repository } from 'typeorm';
import { RedisClient } from '@/common/redis/redis.client.js';
import { hashPassword, verifyPassword } from '@/common/security/password.js';
import { VALIDATION_FAILED_MESSAGE } from '@/common/validation/validation-errors.js';
import { AUTH_MESSAGES, LOGIN_LOCK_SECONDS, LOGIN_MAX_ATTEMPTS, REFRESH_TOKEN_TTL_MS } from '@/modules/auth/auth.constant.js';
import type { StaffProfileDto } from '@/modules/auth/dto/staff-profile.dto.js';
import { RefreshToken, TokenOwnerType } from '@/modules/auth/entities/refresh-token.entity.js';
import { ROLE_PERMISSIONS } from '@/modules/auth/permissions.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthSession {
  staff: StaffUser;
  tokens: IAuthTokens;
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisClient,
    @InjectRepository(StaffUser) private readonly staffUsers: Repository<StaffUser>,
    @InjectRepository(RefreshToken) private readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(Cinema) private readonly cinemas: Repository<Cinema>,
  ) {}

  async login(login: string, password: string): Promise<IAuthSession> {
    const normalizedLogin = login.trim().toLowerCase();
    const attemptsKey = `auth:login-attempts:${normalizedLogin}`;
    if (Number(await this.redis.get(attemptsKey)) >= LOGIN_MAX_ATTEMPTS) {
      throw new HttpException(AUTH_MESSAGES.loginLocked, HttpStatus.TOO_MANY_REQUESTS);
    }

    const staff = await this.staffUsers.findOne({ where: { login: normalizedLogin }, select: { id: true, passwordHash: true, isBlocked: true } });
    if (!staff || !(await verifyPassword(password, staff.passwordHash))) {
      await this.redis.multi().incr(attemptsKey).expire(attemptsKey, LOGIN_LOCK_SECONDS).exec();
      throw new UnauthorizedException(AUTH_MESSAGES.invalidCredentials);
    }
    if (staff.isBlocked) throw new ForbiddenException(AUTH_MESSAGES.staffBlocked);

    await this.redis.del(attemptsKey);
    return this.#openSession(staff.id);
  }

  async refresh(refreshToken?: string): Promise<IAuthSession> {
    const stored =
      refreshToken &&
      (await this.refreshTokens.findOneBy({
        tokenHash: hashToken(refreshToken),
        ownerType: TokenOwnerType.Staff,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      }));
    const { affected } = stored ? await this.refreshTokens.update({ id: stored.id, revokedAt: IsNull() }, { revokedAt: new Date() }) : { affected: 0 };
    if (!stored || !affected) throw new UnauthorizedException(AUTH_MESSAGES.sessionExpired);

    return this.#openSession(stored.ownerId);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) await this.refreshTokens.update({ tokenHash: hashToken(refreshToken), revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  async changePassword(staffId: string, currentPassword: string, newPassword: string): Promise<void> {
    const staff = await this.staffUsers.findOne({ where: { id: staffId }, select: { id: true, passwordHash: true } });

    if (!staff || !(await verifyPassword(currentPassword, staff.passwordHash))) {
      throw new BadRequestException({ message: VALIDATION_FAILED_MESSAGE, errors: { currentPassword: [AUTH_MESSAGES.wrongCurrentPassword] } });
    }

    await this.staffUsers.update({ id: staffId }, { passwordHash: await hashPassword(newPassword), mustChangePassword: false });
  }

  async getProfile({ id, login, fullName, role, mustChangePassword, cinemas }: StaffUser): Promise<StaffProfileDto> {
    const visibleCinemas = role === StaffRole.SuperAdmin ? await this.cinemas.find({ order: { name: 'ASC' } }) : cinemas;

    return {
      id,
      login,
      fullName,
      role,
      mustChangePassword,
      permissions: ROLE_PERMISSIONS[role],
      cinemas: visibleCinemas.map((cinema) => ({ id: cinema.id, name: cinema.name, slug: cinema.slug })),
    };
  }

  async findStaffByAccessToken(accessToken?: string): Promise<StaffUser> {
    const payload = accessToken ? await this.jwt.verifyAsync<{ sub: string }>(accessToken).catch(() => null) : null;
    if (!payload) throw new UnauthorizedException(AUTH_MESSAGES.sessionExpired);

    return this.#findActiveStaff(payload.sub);
  }

  async #findActiveStaff(staffId: string): Promise<StaffUser> {
    const staff = await this.staffUsers.findOne({ where: { id: staffId, isBlocked: false }, relations: { cinemas: true } });
    if (!staff) throw new UnauthorizedException(AUTH_MESSAGES.sessionExpired);

    return staff;
  }

  async #openSession(staffId: string): Promise<IAuthSession> {
    const staff = await this.#findActiveStaff(staffId);
    const refreshToken = randomBytes(32).toString('base64url');
    await this.refreshTokens.insert({
      ownerType: TokenOwnerType.Staff,
      ownerId: staff.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return { staff, tokens: { accessToken: await this.jwt.signAsync({ sub: staff.id }), refreshToken } };
  }
}
