import { BadRequestException, ConflictException, Injectable, NotFoundException, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import type { Repository } from 'typeorm';
import { MailService } from '@/common/mail/mail.service.js';
import { MINUTE_MS } from '@/common/time/zoned-time.js';
import { type EnvironmentVariables, NodeEnvironment } from '@/config/environment.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { createRefundToken } from '@/modules/refunds/refund-token.util.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import type { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import type { CheckInHallOptionDto, CheckInResultDto, CheckInTicketDetailsDto } from '@/modules/tickets/dto/check-in-result.dto.js';
import type { CheckInTicketDto } from '@/modules/tickets/dto/check-in-ticket.dto.js';
import { buildOrderTicketsPdf, type IOrderTicketsPdfData, type TicketPdfFormat } from '@/modules/tickets/ticket-pdf.util.js';
import { generateTicketQrPng, signTicketQrPayload, verifyTicketQrPayload } from '@/modules/tickets/ticket-qr.util.js';
import {
  CHECK_IN_MESSAGES,
  CHECK_IN_OPEN_BEFORE_MINUTES,
  CheckInReasonCode,
  SEND_ORDER_TICKETS_JOB,
  TICKET_EMAILS_QUEUE,
  TICKET_MESSAGES,
} from '@/modules/tickets/tickets.constant.js';

interface ISendOrderTicketsJobData {
  orderId: string;
}

const JOB_ATTEMPTS = 3;
const JOB_BACKOFF_MS = 3_000;

const parseRedisConnection = (redisUrl: string): ConnectionOptions => {
  const parsed = new URL(redisUrl);
  const dbPath = parsed.pathname.replace('/', '');

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    password: parsed.password || undefined,
    db: dbPath ? Number(dbPath) : 0,
    maxRetriesPerRequest: null,
  };
};

const toPdfData = (order: Order): IOrderTicketsPdfData => ({
  orderNumber: order.number,
  filmTitle: order.session.film.title,
  format: order.session.format,
  cinemaName: order.cinema.name,
  cinemaAddress: order.cinema.address,
  cinemaTimezone: order.cinema.timezone,
  hallName: order.session.hall.name,
  startsAt: order.session.startsAt,
  tickets: order.tickets
    .filter((ticket) => ticket.status === TicketStatus.Active || ticket.status === TicketStatus.Used)
    .toSorted((first, second) => first.seat.row - second.seat.row || first.seat.number - second.seat.number)
    .map((ticket) => ({
      code: ticket.code,
      row: ticket.seat.row,
      number: ticket.seat.number,
      price: ticket.price,
    })),
});

const toCheckInTicketDetails = (ticket: Ticket): CheckInTicketDetailsDto => ({
  id: ticket.id,
  code: ticket.code,
  status: ticket.status,
  row: ticket.seat.row,
  number: ticket.seat.number,
  filmTitle: ticket.session.film.title,
  ageRating: ticket.session.film.ageRating,
  hallId: ticket.session.hallId,
  hallName: ticket.session.hall.name,
  cinemaName: ticket.order.cinema.name,
  startsAt: ticket.session.startsAt,
  endsAt: ticket.session.endsAt,
  usedAt: ticket.usedAt,
  usedByName: ticket.usedBy?.fullName ?? null,
});

const denyCheckIn = (reasonCode: CheckInReasonCode, ticket: Ticket | null = null): CheckInResultDto => ({
  allowed: false,
  reasonCode,
  message: CHECK_IN_MESSAGES[reasonCode],
  ticket: ticket ? toCheckInTicketDetails(ticket) : null,
});

@Injectable()
export class TicketsService implements OnModuleInit, OnModuleDestroy {
  readonly #qrSecret: string;
  readonly #cinemaPublicUrl: string;
  readonly #redisUrl: string;
  readonly #isTest: boolean;
  #queue: Queue<ISendOrderTicketsJobData> | null = null;
  #worker: Worker<ISendOrderTicketsJobData> | null = null;

  constructor(
    private readonly mail: MailService,
    config: ConfigService<EnvironmentVariables, true>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
    @InjectRepository(Hall) private readonly halls: Repository<Hall>,
  ) {
    this.#qrSecret = config.get('JWT_ACCESS_SECRET', { infer: true });
    this.#cinemaPublicUrl = config.get('CINEMA_PUBLIC_URL', { infer: true }).replace(/\/+$/, '');
    this.#redisUrl = config.get('REDIS_URL', { infer: true });
    this.#isTest = config.get('NODE_ENV', { infer: true }) === NodeEnvironment.Test;
  }

  onModuleInit(): void {
    if (this.#isTest) return;

    const connection = parseRedisConnection(this.#redisUrl);
    this.#queue = new Queue<ISendOrderTicketsJobData>(TICKET_EMAILS_QUEUE, { connection });
    this.#worker = new Worker<ISendOrderTicketsJobData>(
      TICKET_EMAILS_QUEUE,
      async (job) => {
        await this.sendOrderTicketsEmail(job.data.orderId);
      },
      { connection },
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.#worker) {
      await this.#worker.close();
      this.#worker = null;
    }
    if (this.#queue) {
      await this.#queue.close();
      this.#queue = null;
    }
  }

  signTicketQr(code: string): string {
    return signTicketQrPayload(code, this.#qrSecret);
  }

  async enqueueOrderTicketsEmail(orderId: string): Promise<void> {
    if (this.#isTest || !this.#queue) {
      await this.sendOrderTicketsEmail(orderId);
      return;
    }

    await this.#queue.add(
      SEND_ORDER_TICKETS_JOB,
      { orderId },
      {
        jobId: `order-tickets-${orderId}`,
        attempts: JOB_ATTEMPTS,
        backoff: { type: 'exponential', delay: JOB_BACKOFF_MS },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
  }

  async sendOrderTicketsEmail(orderId: string): Promise<void> {
    const order = await this.#loadOrderForTickets(orderId);
    if (!order || !order.contactEmail) return;
    if (order.status !== OrderStatus.Paid && order.status !== OrderStatus.PartiallyRefunded) return;

    const pdfData = toPdfData(order);
    if (pdfData.tickets.length === 0) return;

    const pdfBuffer = await buildOrderTicketsPdf(pdfData, this.#qrSecret);
    const refundToken = createRefundToken(order.id, order.session.startsAt, this.#qrSecret);
    const refundUrl = `${this.#cinemaPublicUrl}/refund?token=${encodeURIComponent(refundToken)}`;
    const cabinetUrl = `${this.#cinemaPublicUrl}/cabinet/orders/${order.id}`;

    await this.mail.sendMail({
      to: order.contactEmail,
      subject: `Билеты по заказу ${order.number} — Кинотеатр «Луч»`,
      text: [
        `Спасибо за покупку в кинотеатре «Луч»!`,
        `Заказ: ${order.number}`,
        `Фильм: ${pdfData.filmTitle} (${pdfData.format})`,
        `Кинотеатр: ${pdfData.cinemaName}, ${pdfData.cinemaAddress}, зал ${pdfData.hallName}`,
        `PDF с билетами и QR-кодами приложен к этому письму.`,
        `Личный кабинет: ${cabinetUrl}`,
        `Одноразовая ссылка на возврат билетов (действует до начала сеанса): ${refundUrl}`,
      ].join('\n'),
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#060606;color:#ece6d8;">
  <h1 style="margin:0 0 12px;font-size:20px;">Кинотеатр «Луч»</h1>
  <p style="margin:0 0 12px;">Ваши билеты по заказу <strong>${order.number}</strong> готовы и приложены в PDF-файле.</p>
  <p style="margin:0 0 8px;"><strong>${pdfData.filmTitle}</strong> (${pdfData.format})</p>
  <p style="margin:0 0 16px;color:#a8a298;">${pdfData.cinemaName}, ${pdfData.hallName}</p>
  <p style="margin:0 0 8px;font-size:13px;"><a href="${cabinetUrl}" style="color:#f0c779;">Открыть заказ в личном кабинете</a></p>
  <p style="margin:0;font-size:13px;"><a href="${refundUrl}" style="color:#f0c779;">Оформить возврат билетов (одноразовая ссылка)</a></p>
</div>`,
      attachments: [
        {
          filename: `tickets-${order.number}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async generateOrderPdfForCustomer(customerId: string, orderId: string): Promise<{ filename: string; buffer: Buffer }> {
    const order = await this.#loadOrderForTickets(orderId);
    if (!order || order.customerId !== customerId) {
      throw new NotFoundException(TICKET_MESSAGES.orderNotFound);
    }

    const pdfData = toPdfData(order);
    if (pdfData.tickets.length === 0) {
      throw new ConflictException(TICKET_MESSAGES.ticketsNotReady);
    }

    const buffer = await buildOrderTicketsPdf(pdfData, this.#qrSecret);

    return { filename: `tickets-${order.number}.pdf`, buffer };
  }

  async generateOrderPdfForCinema(
    cinemaId: string,
    orderId: string,
    format: TicketPdfFormat = 'a4',
  ): Promise<{ filename: string; buffer: Buffer }> {
    const order = await this.#loadOrderForTickets(orderId);
    if (!order || order.cinemaId !== cinemaId) {
      throw new NotFoundException(TICKET_MESSAGES.orderNotFound);
    }

    const pdfData = toPdfData(order);
    if (pdfData.tickets.length === 0) {
      throw new ConflictException(TICKET_MESSAGES.ticketsNotReady);
    }

    const buffer = await buildOrderTicketsPdf(pdfData, this.#qrSecret, format);

    return { filename: `tickets-${order.number}-${format}.pdf`, buffer };
  }

  async generateTicketQrPngForCustomer(customerId: string, orderId: string, ticketId: string): Promise<Buffer> {
    const order = await this.#loadOrderForTickets(orderId);
    if (!order || order.customerId !== customerId) {
      throw new NotFoundException(TICKET_MESSAGES.orderNotFound);
    }

    const ticket = order.tickets.find((item) => item.id === ticketId);
    if (!ticket) {
      throw new NotFoundException(TICKET_MESSAGES.orderNotFound);
    }
    if (ticket.status !== TicketStatus.Active && ticket.status !== TicketStatus.Used) {
      throw new ConflictException(TICKET_MESSAGES.ticketsNotReady);
    }

    return generateTicketQrPng(signTicketQrPayload(ticket.code, this.#qrSecret));
  }

  async listCinemaHalls(cinemaId: string): Promise<CheckInHallOptionDto[]> {
    const halls = await this.halls.find({
      select: { id: true, name: true, format: true },
      where: { cinemaId },
      order: { name: 'ASC' },
    });

    return halls.map(({ id, name, format }) => ({ id, name, format }));
  }

  async checkInTicket(cinemaId: string, staff: StaffUser, dto: CheckInTicketDto): Promise<CheckInResultDto> {
    if (!dto.qrPayload && !dto.code) {
      throw new BadRequestException(TICKET_MESSAGES.checkInInputRequired);
    }

    let ticketCode: string;
    if (dto.qrPayload) {
      const verifiedCode = verifyTicketQrPayload(dto.qrPayload, this.#qrSecret);
      if (!verifiedCode) return denyCheckIn(CheckInReasonCode.InvalidQr);
      ticketCode = verifiedCode;
    } else {
      ticketCode = dto.code as string;
    }

    const ticket = await this.#loadTicketForCheckIn(ticketCode);
    if (!ticket) return denyCheckIn(CheckInReasonCode.TicketNotFound);

    if (ticket.order.cinemaId !== cinemaId) return denyCheckIn(CheckInReasonCode.WrongCinema, ticket);
    if (dto.hallId && ticket.session.hallId !== dto.hallId) return denyCheckIn(CheckInReasonCode.WrongHall, ticket);
    if (ticket.session.status === SessionStatus.Cancelled) return denyCheckIn(CheckInReasonCode.SessionCancelled, ticket);
    if (ticket.status === TicketStatus.Refunded) return denyCheckIn(CheckInReasonCode.TicketRefunded, ticket);
    if (ticket.status === TicketStatus.Used) return denyCheckIn(CheckInReasonCode.TicketAlreadyUsed, ticket);
    if (ticket.status !== TicketStatus.Active) return denyCheckIn(CheckInReasonCode.TicketNotActive, ticket);

    const now = new Date();
    const opensAt = new Date(ticket.session.startsAt.getTime() - CHECK_IN_OPEN_BEFORE_MINUTES * MINUTE_MS);
    if (now < opensAt) return denyCheckIn(CheckInReasonCode.TooEarly, ticket);
    if (now >= ticket.session.endsAt) return denyCheckIn(CheckInReasonCode.SessionEnded, ticket);

    const updateResult = await this.tickets.update(
      { id: ticket.id, status: TicketStatus.Active },
      { status: TicketStatus.Used, usedAt: now, usedById: staff.id },
    );
    if (!updateResult.affected) {
      const refreshed = await this.#loadTicketForCheckIn(ticketCode);

      return denyCheckIn(CheckInReasonCode.TicketAlreadyUsed, refreshed ?? ticket);
    }

    ticket.status = TicketStatus.Used;
    ticket.usedAt = now;
    ticket.usedById = staff.id;
    ticket.usedBy = staff;

    return {
      allowed: true,
      reasonCode: null,
      message: CHECK_IN_MESSAGES.ALLOWED,
      ticket: toCheckInTicketDetails(ticket),
    };
  }

  #loadTicketForCheckIn(code: string): Promise<Ticket | null> {
    return this.tickets.findOne({
      where: { code },
      relations: {
        seat: true,
        usedBy: true,
        order: { cinema: true },
        session: { film: true, hall: true },
      },
    });
  }

  #loadOrderForTickets(orderId: string): Promise<Order | null> {
    return this.orders.findOne({
      where: { id: orderId },
      relations: { cinema: true, session: { film: true, hall: true }, tickets: { seat: true } },
    });
  }
}
