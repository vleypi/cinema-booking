import { ConflictException, Injectable, NotFoundException, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import type { Repository } from 'typeorm';
import { MailService } from '@/common/mail/mail.service.js';
import { type EnvironmentVariables, NodeEnvironment } from '@/config/environment.js';
import { Order } from '@/modules/orders/entities/order.entity.js';
import { OrderStatus } from '@/modules/orders/order-status.enum.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { buildOrderTicketsPdf, type IOrderTicketsPdfData, type TicketPdfFormat } from '@/modules/tickets/ticket-pdf.util.js';
import { generateTicketQrPng, signTicketQrPayload } from '@/modules/tickets/ticket-qr.util.js';
import { SEND_ORDER_TICKETS_JOB, TICKET_EMAILS_QUEUE, TICKET_MESSAGES } from '@/modules/tickets/tickets.constant.js';

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
    const refundUrl = `${this.#cinemaPublicUrl}/cabinet/orders/${order.id}`;

    await this.mail.sendMail({
      to: order.contactEmail,
      subject: `Билеты по заказу ${order.number} — Кинотеатр «Луч»`,
      text: [
        `Спасибо за покупку в кинотеатре «Луч»!`,
        `Заказ: ${order.number}`,
        `Фильм: ${pdfData.filmTitle} (${pdfData.format})`,
        `Кинотеатр: ${pdfData.cinemaName}, ${pdfData.cinemaAddress}, зал ${pdfData.hallName}`,
        `PDF с билетами и QR-кодами приложен к этому письму.`,
        `Управление заказом и возврат билетов: ${refundUrl}`,
      ].join('\n'),
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#060606;color:#ece6d8;">
  <h1 style="margin:0 0 12px;font-size:20px;">Кинотеатр «Луч»</h1>
  <p style="margin:0 0 12px;">Ваши билеты по заказу <strong>${order.number}</strong> готовы и приложены в PDF-файле.</p>
  <p style="margin:0 0 8px;"><strong>${pdfData.filmTitle}</strong> (${pdfData.format})</p>
  <p style="margin:0 0 16px;color:#a8a298;">${pdfData.cinemaName} · ${pdfData.hallName}</p>
  <p style="margin:0;font-size:13px;"><a href="${refundUrl}" style="color:#f0c779;">Открыть заказ или оформить возврат билетов</a></p>
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

  #loadOrderForTickets(orderId: string): Promise<Order | null> {
    return this.orders.findOne({
      where: { id: orderId },
      relations: { cinema: true, session: { film: true, hall: true }, tickets: { seat: true } },
    });
  }
}
