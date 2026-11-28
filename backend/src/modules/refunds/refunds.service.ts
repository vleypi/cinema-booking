import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, type Repository } from 'typeorm';
import { MailService } from '@/common/mail/mail.service.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import type { EnvironmentVariables } from '@/config/environment.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PaymentStatus } from '@/modules/payments/payment-status.enum.js';
import { YooKassaClient } from '@/modules/payments/yookassa.client.js';
import { formatKopecksToRubles } from '@/modules/payments/yookassa.util.js';
import type { CreateBoxOfficeRefundDto } from '@/modules/refunds/dto/create-refund.dto.js';
import type { RefundDto, RefundPreviewDto } from '@/modules/refunds/dto/refund.dto.js';
import { RefundTicket } from '@/modules/refunds/entities/refund-ticket.entity.js';
import { Refund } from '@/modules/refunds/entities/refund.entity.js';
import { RefundInitiatorType } from '@/modules/refunds/refund-initiator-type.enum.js';
import { RefundReason } from '@/modules/refunds/refund-reason.enum.js';
import { RefundStatus } from '@/modules/refunds/refund-status.enum.js';
import { verifyRefundToken } from '@/modules/refunds/refund-token.util.js';
import { MIN_USED_TOKEN_TTL_SECONDS, REFUND_MESSAGES, usedRefundTokenKey } from '@/modules/refunds/refunds.constant.js';

interface IExecuteRefundParams {
  order: Order;
  ticketIds: readonly string[];
  reason: RefundReason;
  initiatorType: RefundInitiatorType;
  initiatorStaffId: string | null;
  allowAfterStart?: boolean;
  boxOfficeRefundMethod?: PaymentProvider;
}

@Injectable()
export class RefundsService {
  readonly #tokenSecret: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly redis: RedisClient,
    private readonly mail: MailService,
    private readonly yooKassa: YooKassaClient,
    config: ConfigService<EnvironmentVariables, true>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
  ) {
    this.#tokenSecret = config.get('JWT_ACCESS_SECRET', { infer: true });
  }

  async refundByCustomer(customerId: string, orderId: string, ticketIds: readonly string[]): Promise<RefundDto> {
    const order = await this.#loadOrder(orderId);
    if (!order || order.customerId !== customerId) {
      throw new NotFoundException(REFUND_MESSAGES.orderNotFound);
    }

    return this.#executeRefund({
      order,
      ticketIds,
      reason: RefundReason.CustomerRequest,
      initiatorType: RefundInitiatorType.Customer,
      initiatorStaffId: null,
    });
  }

  async previewRefundByToken(token: string): Promise<RefundPreviewDto> {
    const payload = verifyRefundToken(token, this.#tokenSecret);
    if (!payload) {
      throw new BadRequestException(REFUND_MESSAGES.invalidRefundToken);
    }

    const used = await this.redis.get(usedRefundTokenKey(payload.jti));
    if (used) {
      throw new ConflictException(REFUND_MESSAGES.refundTokenAlreadyUsed);
    }

    const order = await this.#loadOrder(payload.orderId);
    if (!order) {
      throw new NotFoundException(REFUND_MESSAGES.orderNotFound);
    }
    if (order.session.startsAt <= new Date()) {
      throw new ConflictException(REFUND_MESSAGES.sessionAlreadyStarted);
    }

    return {
      orderId: order.id,
      orderNumber: order.number,
      filmTitle: order.session.film.title,
      cinemaName: order.cinema.name,
      hallName: order.session.hall.name,
      startsAt: order.session.startsAt,
      tickets: order.tickets
        .toSorted((first, second) => first.seat.row - second.seat.row || first.seat.number - second.seat.number)
        .map((ticket) => ({
          id: ticket.id,
          code: ticket.code,
          row: ticket.seat.row,
          number: ticket.seat.number,
          price: ticket.price,
          status: ticket.status,
        })),
    };
  }

  async refundByToken(token: string, ticketIds: readonly string[]): Promise<RefundDto> {
    const payload = verifyRefundToken(token, this.#tokenSecret);
    if (!payload) {
      throw new BadRequestException(REFUND_MESSAGES.invalidRefundToken);
    }

    const ttlSeconds = Math.max(MIN_USED_TOKEN_TTL_SECONDS, payload.exp - Math.floor(Date.now() / 1000) + MIN_USED_TOKEN_TTL_SECONDS);
    const key = usedRefundTokenKey(payload.jti);
    const marked = await this.redis.set(key, '1', 'EX', ttlSeconds, 'NX');
    if (marked !== 'OK') {
      throw new ConflictException(REFUND_MESSAGES.refundTokenAlreadyUsed);
    }

    try {
      const order = await this.#loadOrder(payload.orderId);
      if (!order) {
        throw new NotFoundException(REFUND_MESSAGES.orderNotFound);
      }

      return await this.#executeRefund({
        order,
        ticketIds,
        reason: RefundReason.CustomerRequest,
        initiatorType: RefundInitiatorType.Customer,
        initiatorStaffId: null,
      });
    } catch (error) {
      await this.redis.del(key);
      throw error;
    }
  }

  async refundInBoxOffice(
    cinemaId: string,
    staffId: string,
    orderId: string,
    dto: CreateBoxOfficeRefundDto,
  ): Promise<RefundDto> {
    const order = await this.#loadOrder(orderId);
    if (!order || order.cinemaId !== cinemaId) {
      throw new NotFoundException(REFUND_MESSAGES.orderNotFound);
    }

    return this.#executeRefund({
      order,
      ticketIds: dto.ticketIds,
      reason: RefundReason.CustomerRequest,
      initiatorType: RefundInitiatorType.Staff,
      initiatorStaffId: staffId,
      boxOfficeRefundMethod: dto.refundMethod,
    });
  }

  async refundOrderForSessionCancellation(orderId: string, staffId: string): Promise<RefundDto | null> {
    const order = await this.#loadOrder(orderId);
    if (!order) return null;

    const activeTicketIds = order.tickets.filter((ticket) => ticket.status === TicketStatus.Active).map((ticket) => ticket.id);
    if (activeTicketIds.length === 0) return null;

    return this.#executeRefund({
      order,
      ticketIds: activeTicketIds,
      reason: RefundReason.SessionCancelled,
      initiatorType: RefundInitiatorType.Staff,
      initiatorStaffId: staffId,
      allowAfterStart: true,
      boxOfficeRefundMethod: PaymentProvider.Cash,
    });
  }

  async #executeRefund(params: IExecuteRefundParams): Promise<RefundDto> {
    const { order, ticketIds, reason, initiatorType, initiatorStaffId, allowAfterStart = false, boxOfficeRefundMethod } = params;

    if (!allowAfterStart && order.session.startsAt <= new Date()) {
      throw new ConflictException(REFUND_MESSAGES.sessionAlreadyStarted);
    }

    const targetTickets = order.tickets.filter((ticket) => ticketIds.includes(ticket.id));
    if (targetTickets.length !== ticketIds.length || targetTickets.some((ticket) => ticket.status !== TicketStatus.Active)) {
      throw new ConflictException(REFUND_MESSAGES.ticketsNotRefundable);
    }

    const payment = await this.payments.findOne({
      where: { orderId: order.id, status: PaymentStatus.Succeeded },
      order: { id: 'DESC' },
    });
    if (!payment) {
      throw new ConflictException(REFUND_MESSAGES.paymentNotFound);
    }

    if (payment.provider !== PaymentProvider.YooKassa) {
      if (initiatorType === RefundInitiatorType.Customer) {
        throw new ConflictException(REFUND_MESSAGES.boxOfficeRefundInCashierOnly);
      }
      if (!boxOfficeRefundMethod) {
        throw new BadRequestException(REFUND_MESSAGES.refundMethodRequired);
      }
    }

    const amount = targetTickets.reduce((sum, ticket) => sum + ticket.price, 0);

    let externalId: string | null = null;
    if (payment.provider === PaymentProvider.YooKassa && payment.externalId) {
      const remoteRefund = await this.yooKassa.createRefund({
        paymentExternalId: payment.externalId,
        amountKopecks: amount,
        idempotenceKey: randomUUID(),
        description: `Возврат билетов по заказу ${order.number}`,
      });
      externalId = remoteRefund.id;
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const ticketUpdate = await manager
        .getRepository(Ticket)
        .update({ id: In([...ticketIds]), orderId: order.id, status: TicketStatus.Active }, { status: TicketStatus.Refunded });

      if (ticketUpdate.affected !== ticketIds.length) {
        throw new ConflictException(REFUND_MESSAGES.ticketsNotRefundable);
      }

      const refund = await manager.getRepository(Refund).save(
        manager.getRepository(Refund).create({
          paymentId: payment.id,
          amount,
          reason,
          initiatorType,
          initiatorStaffId,
          externalId,
          status: RefundStatus.Succeeded,
        }),
      );

      await manager.getRepository(RefundTicket).save(
        ticketIds.map((ticketId) =>
          manager.getRepository(RefundTicket).create({
            refundId: refund.id,
            ticketId,
          }),
        ),
      );

      const remainingTickets = await manager.getRepository(Ticket).count({
        where: { orderId: order.id, status: In([TicketStatus.Active, TicketStatus.Used]) },
      });
      const nextOrderStatus = remainingTickets === 0 ? OrderStatus.Refunded : OrderStatus.PartiallyRefunded;
      await manager.getRepository(Order).update({ id: order.id }, { status: nextOrderStatus });

      return { refund, orderStatus: nextOrderStatus };
    });

    if (order.contactEmail) {
      const rubleAmount = formatKopecksToRubles(amount);
      const subject =
        reason === RefundReason.SessionCancelled
          ? `Отмена сеанса и возврат по заказу ${order.number} — Кинотеатр «Луч»`
          : `Возврат билетов по заказу ${order.number} — Кинотеатр «Луч»`;
      const reasonLine =
        reason === RefundReason.SessionCancelled
          ? `Сеанс «${order.session.film.title}» отменен. Оформлен полный возврат средств.`
          : `Оформлен возврат билетов по заказу ${order.number}.`;

      await this.mail
        .sendMail({
          to: order.contactEmail,
          subject,
          text: `${reasonLine}\nСумма возврата: ${rubleAmount} ₽.\nКоличество билетов: ${ticketIds.length}.`,
          html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#060606;color:#ece6d8;">
  <h1 style="margin:0 0 12px;font-size:20px;">Кинотеатр «Луч»</h1>
  <p style="margin:0 0 12px;">${reasonLine}</p>
  <p style="margin:0;">Сумма возврата: <strong>${rubleAmount} ₽</strong> (${ticketIds.length} шт.)</p>
</div>`,
        })
        .catch(() => undefined);
    }

    return {
      id: result.refund.id,
      orderId: order.id,
      orderStatus: result.orderStatus,
      paymentId: payment.id,
      amount: result.refund.amount,
      reason: result.refund.reason,
      initiatorType: result.refund.initiatorType,
      status: result.refund.status,
      ticketIds: [...ticketIds],
    };
  }

  #loadOrder(orderId: string): Promise<Order | null> {
    return this.orders.findOne({
      where: { id: orderId },
      relations: { cinema: true, session: { film: true, hall: true }, tickets: { seat: true } },
    });
  }
}
