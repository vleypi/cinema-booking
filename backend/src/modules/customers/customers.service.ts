import { randomBytes } from 'node:crypto';
import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Not, type Repository } from 'typeorm';
import { MailService } from '@/common/mail/mail.service.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { REFRESH_TOKEN_TTL_MS } from '@/modules/auth/auth.constant.js';
import type { IAuthTokens } from '@/modules/auth/auth.service.js';
import { RefreshToken, TokenOwnerType } from '@/modules/auth/entities/refresh-token.entity.js';
import {
  CUSTOMER_MESSAGES,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  otpCooldownKey,
  otpRedisKey,
} from '@/modules/customers/customers.constant.js';
import type { CustomerOrderDto, CustomerOrdersListDto } from '@/modules/customers/dto/customer-order.dto.js';
import type { CustomerProfileDto } from '@/modules/customers/dto/customer-profile.dto.js';
import type { UpdateCustomerProfileDto } from '@/modules/customers/dto/update-customer-profile.dto.js';
import { Customer } from '@/modules/customers/entities/customer.entity.js';
import { buildOtpEmail, generateOtpCode, hashOtpValue, verifyOtpHash } from '@/modules/customers/otp.util.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';

interface IStoredOtp {
  hash: string;
  attempts: number;
}

export interface ICustomerAuthSession {
  customer: Customer;
  tokens: IAuthTokens;
}

const toProfile = ({ id, email, name, phone, emailVerifiedAt }: Customer): CustomerProfileDto => ({
  id,
  email,
  name,
  phone,
  emailVerifiedAt,
});

const toCustomerOrder = (order: Order): CustomerOrderDto => ({
  id: order.id,
  number: order.number,
  channel: order.channel,
  status: order.status,
  totalAmount: order.totalAmount,
  holdExpiresAt: order.holdExpiresAt,
  createdAt: order.createdAt,
  cinema: {
    id: order.cinema.id,
    name: order.cinema.name,
    address: order.cinema.address,
    timezone: order.cinema.timezone,
  },
  session: {
    id: order.session.id,
    startsAt: order.session.startsAt,
    endsAt: order.session.endsAt,
    format: order.session.format,
    filmId: order.session.film.id,
    filmTitle: order.session.film.title,
    posterFileId: order.session.film.posterFileId,
    hallName: order.session.hall.name,
  },
  tickets: order.tickets.map(({ id, code, price, status, seat }) => ({
    id,
    code,
    price,
    status,
    row: seat.row,
    number: seat.number,
    seatType: seat.type,
  })),
});

@Injectable()
export class CustomersService {
  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisClient,
    private readonly mail: MailService,
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    @InjectRepository(RefreshToken) private readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async requestOtp(email: string): Promise<void> {
    const cooldownSet = await this.redis.set(otpCooldownKey(email), '1', 'EX', OTP_RESEND_COOLDOWN_SECONDS, 'NX');
    if (cooldownSet !== 'OK') {
      throw new HttpException(CUSTOMER_MESSAGES.otpCooldown, HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = generateOtpCode();
    const record: IStoredOtp = { hash: hashOtpValue(code), attempts: 0 };
    await this.redis.set(otpRedisKey(email), JSON.stringify(record), 'EX', OTP_TTL_SECONDS);

    try {
      const message = buildOtpEmail(code);
      await this.mail.sendMail({ to: email, ...message });
    } catch (error) {
      await this.redis.del(otpRedisKey(email), otpCooldownKey(email));
      throw error;
    }
  }

  async verifyOtp(email: string, code: string): Promise<ICustomerAuthSession> {
    const key = otpRedisKey(email);
    const raw = await this.redis.get(key);
    if (!raw) throw new UnauthorizedException(CUSTOMER_MESSAGES.invalidOtp);

    const stored = JSON.parse(raw) as IStoredOtp;
    if (!verifyOtpHash(code, stored.hash)) {
      const nextAttempts = stored.attempts + 1;
      if (nextAttempts >= OTP_MAX_ATTEMPTS) {
        await this.redis.del(key);
      } else {
        const ttl = await this.redis.ttl(key);
        if (ttl > 0) {
          await this.redis.set(key, JSON.stringify({ hash: stored.hash, attempts: nextAttempts }), 'EX', ttl);
        }
      }
      throw new UnauthorizedException(CUSTOMER_MESSAGES.invalidOtp);
    }

    await this.redis.del(key);

    let customer = await this.customers.findOneBy({ email });
    const now = new Date();
    if (!customer) {
      customer = await this.customers.save(
        this.customers.create({
          email,
          emailVerifiedAt: now,
          name: null,
          phone: null,
          passwordHash: null,
        }),
      );
    } else if (!customer.emailVerifiedAt) {
      customer.emailVerifiedAt = now;
      customer = await this.customers.save(customer);
    }

    return this.#openSession(customer);
  }

  async refresh(refreshToken?: string): Promise<ICustomerAuthSession> {
    const stored =
      refreshToken &&
      (await this.refreshTokens.findOneBy({
        tokenHash: hashOtpValue(refreshToken),
        ownerType: TokenOwnerType.Customer,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      }));
    const { affected } = stored ? await this.refreshTokens.update({ id: stored.id, revokedAt: IsNull() }, { revokedAt: new Date() }) : { affected: 0 };
    if (!stored || !affected) throw new UnauthorizedException(CUSTOMER_MESSAGES.sessionExpired);

    const customer = await this.customers.findOneBy({ id: stored.ownerId, emailVerifiedAt: Not(IsNull()) });
    if (!customer) throw new UnauthorizedException(CUSTOMER_MESSAGES.sessionExpired);

    return this.#openSession(customer);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.refreshTokens.update(
        { tokenHash: hashOtpValue(refreshToken), ownerType: TokenOwnerType.Customer, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
    }
  }

  async findVerifiedCustomerByAccessToken(accessToken?: string): Promise<Customer> {
    const payload = accessToken
      ? await this.jwt.verifyAsync<{ sub: string; ownerType?: TokenOwnerType }>(accessToken).catch(() => null)
      : null;
    if (!payload || payload.ownerType !== TokenOwnerType.Customer) {
      throw new UnauthorizedException(CUSTOMER_MESSAGES.sessionExpired);
    }

    const customer = await this.customers.findOneBy({ id: payload.sub, emailVerifiedAt: Not(IsNull()) });
    if (!customer) throw new UnauthorizedException(CUSTOMER_MESSAGES.sessionExpired);

    return customer;
  }

  getProfile(customer: Customer): CustomerProfileDto {
    return toProfile(customer);
  }

  async updateProfile(customer: Customer, dto: UpdateCustomerProfileDto): Promise<CustomerProfileDto> {
    if (dto.name !== undefined) customer.name = dto.name;
    if (dto.phone !== undefined) customer.phone = dto.phone;
    const saved = await this.customers.save(customer);

    return toProfile(saved);
  }

  async getOrders(customerId: string): Promise<CustomerOrdersListDto> {
    const orders = await this.orders.find({
      where: { customerId, status: Not(OrderStatus.Expired) },
      relations: { cinema: true, session: { film: true, hall: true }, tickets: { seat: true } },
      order: { createdAt: 'DESC', id: 'DESC' },
    });

    const now = new Date();
    const upcoming: CustomerOrderDto[] = [];
    const past: CustomerOrderDto[] = [];

    for (const order of orders) {
      const dto = toCustomerOrder(order);
      if (order.session.endsAt > now) {
        upcoming.push(dto);
      } else {
        past.push(dto);
      }
    }

    return { upcoming, past };
  }

  async getOrder(customerId: string, orderId: string): Promise<CustomerOrderDto> {
    const order = await this.orders.findOne({
      where: { id: orderId, customerId },
      relations: { cinema: true, session: { film: true, hall: true }, tickets: { seat: true } },
    });
    if (!order) throw new NotFoundException(CUSTOMER_MESSAGES.orderNotFound);

    return toCustomerOrder(order);
  }

  async #openSession(customer: Customer): Promise<ICustomerAuthSession> {
    const refreshToken = randomBytes(32).toString('base64url');
    await this.refreshTokens.insert({
      ownerType: TokenOwnerType.Customer,
      ownerId: customer.id,
      tokenHash: hashOtpValue(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    const accessToken = await this.jwt.signAsync({ sub: customer.id, ownerType: TokenOwnerType.Customer });

    return { customer, tokens: { accessToken, refreshToken } };
  }
}
