import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type Repository } from 'typeorm';
import { RedisClient } from '@/common/redis/redis.client.js';
import type { EnvironmentVariables } from '@/config/environment.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderChannel } from '@/modules/orders/order-channel.enum.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { seatHoldKey } from '@/modules/orders/orders.constant.js';
import { OrdersService } from '@/modules/orders/orders.service.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import type { PaymentDto, WebhookAckDto } from '@/modules/payments/dto/payment.dto.js';
import type { YooKassaWebhookDto } from '@/modules/payments/dto/yookassa-webhook.dto.js';
import { Payment } from '@/modules/payments/entities/payment.entity.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { PaymentStatus } from '@/modules/payments/payment-status.enum.js';
import { PAYMENT_CURRENCY, PAYMENT_MESSAGES, YOOKASSA_WEBHOOK_EVENTS } from '@/modules/payments/payments.constant.js';
import { YooKassaClient } from '@/modules/payments/yookassa.client.js';
import { parseRublesToKopecks } from '@/modules/payments/yookassa.util.js';

@Injectable()
export class PaymentsService {
  readonly #cinemaPublicUrl: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly redis: RedisClient,
    private readonly ordersService: OrdersService,
    private readonly yooKassa: YooKassaClient,
    config: ConfigService<EnvironmentVariables, true>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
  ) {
    this.#cinemaPublicUrl = config.get('CINEMA_PUBLIC_URL', { infer: true }).replace(/\/+$/, '');
  }

  async createOnlinePayment(orderId: string): Promise<PaymentDto> {
    const initialOrder = await this.orders.findOneBy({ id: orderId });
    if (!initialOrder) throw new NotFoundException(PAYMENT_MESSAGES.orderNotFound);

    await this.ordersService.releaseExpiredHolds(initialOrder.sessionId);
    const order = await this.orders.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException(PAYMENT_MESSAGES.orderNotFound);

    if (order.channel !== OrderChannel.Online || order.status !== OrderStatus.PendingPayment) {
      throw new ConflictException(PAYMENT_MESSAGES.orderNotPayable);
    }
    if (order.holdExpiresAt && order.holdExpiresAt <= new Date()) {
      throw new ConflictException(PAYMENT_MESSAGES.orderHoldExpired);
    }

    const idempotenceKey = randomUUID();
    const payment = await this.payments.save(
      this.payments.create({
        orderId: order.id,
        provider: PaymentProvider.YooKassa,
        externalId: null,
        idempotenceKey,
        amount: order.totalAmount,
        status: PaymentStatus.Pending,
        paidAt: null,
      }),
    );

    try {
      const remote = await this.yooKassa.createPayment({
        amountKopecks: order.totalAmount,
        description: `Заказ ${order.number}`,
        returnUrl: `${this.#cinemaPublicUrl}/orders/${order.number}`,
        idempotenceKey,
        metadata: { orderId: order.id, orderNumber: order.number },
      });

      payment.externalId = remote.id;
      const saved = await this.payments.save(payment);

      return {
        id: saved.id,
        orderId: order.id,
        orderNumber: order.number,
        provider: saved.provider,
        externalId: saved.externalId,
        amount: saved.amount,
        status: saved.status,
        confirmationUrl: remote.confirmation?.confirmation_url ?? null,
        paidAt: saved.paidAt,
      };
    } catch (error) {
      await this.payments.update({ id: payment.id }, { status: PaymentStatus.Canceled });
      throw error;
    }
  }

  async handleYooKassaWebhook(dto: YooKassaWebhookDto): Promise<WebhookAckDto> {
    if (dto.event !== YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded && dto.event !== YOOKASSA_WEBHOOK_EVENTS.paymentCanceled) {
      return { ok: true };
    }

    const payment = await this.payments.findOneBy({ externalId: dto.object.id, provider: PaymentProvider.YooKassa });
    if (!payment) {
      throw new BadRequestException(PAYMENT_MESSAGES.paymentVerificationFailed);
    }

    const remote = await this.yooKassa.getPayment(dto.object.id);
    const remoteKopecks = parseRublesToKopecks(remote.amount.value);
    if (remote.amount.currency !== PAYMENT_CURRENCY || remoteKopecks !== payment.amount) {
      throw new BadRequestException(PAYMENT_MESSAGES.paymentAmountMismatch);
    }

    if (dto.event === YOOKASSA_WEBHOOK_EVENTS.paymentSucceeded) {
      if (remote.status !== 'succeeded') {
        throw new BadRequestException(PAYMENT_MESSAGES.paymentVerificationFailed);
      }
      if (payment.status === PaymentStatus.Succeeded) {
        return { ok: true };
      }

      const paidAt = remote.captured_at ? new Date(remote.captured_at) : new Date();
      const activatedTickets = await this.dataSource.transaction(async (manager) => {
        const paymentResult = await manager
          .getRepository(Payment)
          .update({ id: payment.id, status: PaymentStatus.Pending }, { status: PaymentStatus.Succeeded, paidAt });
        if (!paymentResult.affected) return [];

        const orderResult = await manager
          .getRepository(Order)
          .update({ id: payment.orderId, status: OrderStatus.PendingPayment }, { status: OrderStatus.Paid, holdExpiresAt: null });
        if (!orderResult.affected) return [];

        const tickets = await manager.getRepository(Ticket).find({
          select: { id: true, sessionId: true, seatId: true },
          where: { orderId: payment.orderId, status: TicketStatus.Reserved },
        });
        if (tickets.length > 0) {
          await manager.getRepository(Ticket).update({ orderId: payment.orderId, status: TicketStatus.Reserved }, { status: TicketStatus.Active });
        }

        return tickets;
      });

      if (activatedTickets.length > 0) {
        await this.redis.del(...activatedTickets.map((ticket) => seatHoldKey(ticket.sessionId, ticket.seatId)));
      }

      return { ok: true };
    }

    if (remote.status !== 'canceled') {
      throw new BadRequestException(PAYMENT_MESSAGES.paymentVerificationFailed);
    }
    if (payment.status === PaymentStatus.Pending) {
      await this.payments.update({ id: payment.id, status: PaymentStatus.Pending }, { status: PaymentStatus.Canceled });
    }

    return { ok: true };
  }
}
