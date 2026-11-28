import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { MINUTE_MS } from '@/common/time/zoned-time.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Ticket } from '@/modules/orders/entities/ticket.entity.js';
import { TicketStatus } from '@/modules/orders/ticket-status.enum.js';
import { PaymentProvider } from '@/modules/payments/payment-provider.enum.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { SessionFormat } from '@/modules/sessions/session-format.enum.js';
import { SessionStatus } from '@/modules/sessions/session-status.enum.js';
import { StaffUser } from '@/modules/staff/entities/staff-user.entity.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { CheckInReasonCode } from '@/modules/tickets/tickets.constant.js';
import { DEFAULT_TIME_BANDS } from '@/modules/time-bands/time-bands.constant.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { FILMS_URL, filmBody } from '@test/support/film.fixture.js';
import { createHallWithLayout, type IHallWithLayout } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const checkInUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/tickets/check-in`;
const hallsUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/tickets/halls`;
const boxOfficeOrdersUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/box-office/orders`;

describe('Ticket Check-In API (4.2)', () => {
  let app: INestApplication;
  let cinemaId: string;
  let otherCinemaId: string;
  let cashier: StaffAgent;
  let controller: StaffAgent;
  let controllerFullName: string;
  let foreignController: StaffAgent;
  let mainHall: IHallWithLayout;
  let otherHall: IHallWithLayout;
  let filmId: string;
  let seatIds: string[];

  const createSessionAt = async (startsOffsetMin: number, endsOffsetMin: number, status = SessionStatus.Scheduled): Promise<string> => {
    const repo = app.get(DataSource).getRepository(Session);
    const saved = await repo.save(
      repo.create({
        hallId: mainHall.hallId,
        layoutId: mainHall.layoutId,
        filmId,
        startsAt: new Date(Date.now() + startsOffsetMin * MINUTE_MS),
        endsAt: new Date(Date.now() + endsOffsetMin * MINUTE_MS),
        format: SessionFormat.TwoD,
        status,
      }),
    );

    return saved.id;
  };

  const sellTicket = async (sessionId: string, seatId: string): Promise<{ id: string; code: string; qrPayload: string }> => {
    const { body } = await cashier
      .post(boxOfficeOrdersUrl(cinemaId))
      .send({ sessionId, seatIds: [seatId], paymentMethod: PaymentProvider.Cash })
      .expect(201);

    return body.tickets[0];
  };

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    otherCinemaId = await createCinema(app);
    const dataSource = app.get(DataSource);

    const admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));
    cashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] }));

    const controllerStaff = await createStaff(app, { role: StaffRole.Controller, cinemaIds: [cinemaId] });
    controllerFullName = (await dataSource.getRepository(StaffUser).findOneByOrFail({ id: controllerStaff.id })).fullName;
    controller = await loginAs(app, controllerStaff);
    foreignController = await loginAs(app, await createStaff(app, { role: StaffRole.Controller, cinemaIds: [otherCinemaId] }));

    await admin.put(`/${API_PREFIX}/cinemas/${cinemaId}/time-bands`).send({ bands: DEFAULT_TIME_BANDS }).expect(200);

    mainHall = await createHallWithLayout(admin, cinemaId);
    otherHall = await createHallWithLayout(admin, cinemaId);

    const seats = await dataSource.getRepository(Seat).find({ where: { layoutId: mainHall.layoutId }, order: { id: 'ASC' } });
    seatIds = seats.map(({ id }) => id);

    filmId = (await manager.post(FILMS_URL).send({ ...filmBody(), title: 'Проходной фильм', ageRating: AgeRating.Sixteen }).expect(201)).body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists cinema halls for controller and enforces cinema scoping', async () => {
    const { body: halls } = await controller.get(hallsUrl(cinemaId)).expect(200);
    expect(halls.map((hall: { id: string }) => hall.id)).toEqual(expect.arrayContaining([mainHall.hallId, otherHall.hallId]));

    await foreignController.get(hallsUrl(cinemaId)).expect(403);
    await foreignController.post(checkInUrl(cinemaId)).send({ code: 'AAAAAAAAAA' }).expect(403);
  });

  it('allows valid QR check-in once, returns usedAt and usedByName on repeat, and prevents concurrent double entry', async () => {
    const sessionId = await createSessionAt(15, 120);
    const firstTicket = await sellTicket(sessionId, seatIds[0]);
    const raceTicket = await sellTicket(sessionId, seatIds[1]);

    const firstPass = await controller
      .post(checkInUrl(cinemaId))
      .send({ qrPayload: firstTicket.qrPayload, hallId: mainHall.hallId })
      .expect(200);

    expect(firstPass.body).toMatchObject({
      allowed: true,
      reasonCode: null,
      ticket: {
        id: firstTicket.id,
        code: firstTicket.code,
        status: TicketStatus.Used,
        usedByName: controllerFullName,
      },
    });
    expect(firstPass.body.ticket.usedAt).toEqual(expect.any(String));

    const repeatPass = await controller.post(checkInUrl(cinemaId)).send({ qrPayload: firstTicket.qrPayload }).expect(200);
    expect(repeatPass.body).toMatchObject({
      allowed: false,
      reasonCode: CheckInReasonCode.TicketAlreadyUsed,
      ticket: {
        id: firstTicket.id,
        usedByName: controllerFullName,
      },
    });
    expect(repeatPass.body.ticket.usedAt).toEqual(expect.any(String));

    const [firstRace, secondRace] = await Promise.all([
      controller.post(checkInUrl(cinemaId)).send({ qrPayload: raceTicket.qrPayload }),
      controller.post(checkInUrl(cinemaId)).send({ qrPayload: raceTicket.qrPayload }),
    ]);

    expect([firstRace.body.allowed, secondRace.body.allowed].toSorted((a, b) => Number(a) - Number(b))).toEqual([false, true]);
  });

  it('accepts case-insensitive manual code and denies forged QR, wrong hall, wrong cinema, refunded, cancelled, and out-of-window tickets', async () => {
    const activeSessionId = await createSessionAt(10, 120);
    const manualTicket = await sellTicket(activeSessionId, seatIds[2]);
    const wrongHallTicket = await sellTicket(activeSessionId, seatIds[3]);
    const refundedTicket = await sellTicket(activeSessionId, seatIds[4]);
    const reservedTicket = await sellTicket(activeSessionId, seatIds[5]);

    const manualPass = await controller
      .post(checkInUrl(cinemaId))
      .send({ code: `  ${manualTicket.code.toLowerCase()}  `, hallId: mainHall.hallId })
      .expect(200);
    expect(manualPass.body.allowed).toBe(true);

    const forgedQr = await controller
      .post(checkInUrl(cinemaId))
      .send({ qrPayload: `${wrongHallTicket.qrPayload.slice(0, -1)}Z` })
      .expect(200);
    expect(forgedQr.body).toMatchObject({ allowed: false, reasonCode: CheckInReasonCode.InvalidQr, ticket: null });

    const wrongHall = await controller
      .post(checkInUrl(cinemaId))
      .send({ qrPayload: wrongHallTicket.qrPayload, hallId: otherHall.hallId })
      .expect(200);
    expect(wrongHall.body).toMatchObject({ allowed: false, reasonCode: CheckInReasonCode.WrongHall });

    const wrongCinema = await foreignController
      .post(checkInUrl(otherCinemaId))
      .send({ qrPayload: wrongHallTicket.qrPayload })
      .expect(200);
    expect(wrongCinema.body).toMatchObject({ allowed: false, reasonCode: CheckInReasonCode.WrongCinema });

    const ticketRepo = app.get(DataSource).getRepository(Ticket);
    await ticketRepo.update({ id: refundedTicket.id }, { status: TicketStatus.Refunded });
    await ticketRepo.update({ id: reservedTicket.id }, { status: TicketStatus.Reserved });

    const refundedRes = await controller.post(checkInUrl(cinemaId)).send({ code: refundedTicket.code }).expect(200);
    expect(refundedRes.body).toMatchObject({ allowed: false, reasonCode: CheckInReasonCode.TicketRefunded });

    const reservedRes = await controller.post(checkInUrl(cinemaId)).send({ code: reservedTicket.code }).expect(200);
    expect(reservedRes.body).toMatchObject({ allowed: false, reasonCode: CheckInReasonCode.TicketNotActive });

    const earlySessionId = await createSessionAt(60, 180);
    const earlyTicket = await sellTicket(earlySessionId, seatIds[0]);
    const tooEarly = await controller.post(checkInUrl(cinemaId)).send({ qrPayload: earlyTicket.qrPayload }).expect(200);
    expect(tooEarly.body).toMatchObject({ allowed: false, reasonCode: CheckInReasonCode.TooEarly });

    const cancelledSessionId = await createSessionAt(15, 120);
    const cancelledTicket = await sellTicket(cancelledSessionId, seatIds[0]);
    await app.get(DataSource).getRepository(Session).update({ id: cancelledSessionId }, { status: SessionStatus.Cancelled });
    const cancelledRes = await controller.post(checkInUrl(cinemaId)).send({ qrPayload: cancelledTicket.qrPayload }).expect(200);
    expect(cancelledRes.body).toMatchObject({ allowed: false, reasonCode: CheckInReasonCode.SessionCancelled });

    const endedSessionId = await createSessionAt(15, 120);
    const endedTicket = await sellTicket(endedSessionId, seatIds[0]);
    await app
      .get(DataSource)
      .getRepository(Session)
      .update({ id: endedSessionId }, { startsAt: new Date(Date.now() - 180 * MINUTE_MS), endsAt: new Date(Date.now() - 30 * MINUTE_MS) });
    const endedRes = await controller.post(checkInUrl(cinemaId)).send({ qrPayload: endedTicket.qrPayload }).expect(200);
    expect(endedRes.body).toMatchObject({ allowed: false, reasonCode: CheckInReasonCode.SessionEnded });

    await controller.post(checkInUrl(cinemaId)).send({}).expect(400);
  });
});
