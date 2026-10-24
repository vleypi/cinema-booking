import type { INestApplication } from '@nestjs/common';
import { API_PREFIX } from '@/app.setup.js';
import { RedisClient } from '@/common/redis/redis.client.js';
import { RECORD_NOT_FOUND_MESSAGE } from '@/common/validation/parse-id.pipe.js';
import { AUTH_MESSAGES } from '@/modules/auth/auth.constant.js';
import { HALL_MESSAGES } from '@/modules/halls/halls.constant.js';
import { SeatType } from '@/modules/halls/seat-type.enum.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';
import { loginAs, type StaffAgent } from '@test/support/auth.helpers.js';
import { createTestApp } from '@test/support/create-test-app.js';
import { buildUseCaseSeats, cinemaHallsUrl, HALL_BODY, HALLS_URL, ROWS, SEATS_PER_ROW } from '@test/support/hall.fixture.js';
import { createCinema, createStaff } from '@test/support/staff.fixture.js';

const PRICE_ZONES_URL = `/${API_PREFIX}/price-zones`;

describe('Halls', () => {
  let app: INestApplication;
  let cinemaId: string;
  let admin: StaffAgent;
  let foreignAdmin: StaffAgent;

  const createHall = async () => (await admin.post(cinemaHallsUrl(cinemaId)).send(HALL_BODY).expect(201)).body;
  const createZone = async (hallId: string, name = 'Обычные места', multiplier = 1) =>
    (await admin.post(`${HALLS_URL}/${hallId}/price-zones`).send({ name, multiplier }).expect(201)).body;

  beforeAll(async () => {
    app = await createTestApp();
    await app.get(RedisClient).flushdb();

    cinemaId = await createCinema(app);
    admin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [cinemaId] }));
    foreignAdmin = await loginAs(app, await createStaff(app, { role: StaffRole.Admin, cinemaIds: [await createCinema(app)] }));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('halls', () => {
    it('creates a hall and lists it with its price zones', async () => {
      const hall = await createHall();
      const zone = await createZone(hall.id, 'Лучшие места', 1.25);

      const { body } = await admin.get(cinemaHallsUrl(cinemaId)).expect(200);

      expect(hall).toMatchObject({ ...HALL_BODY, cinemaId, isActive: true, priceZones: [] });
      expect(body).toContainEqual(expect.objectContaining({ id: hall.id, priceZones: [expect.objectContaining({ id: zone.id, multiplier: 1.25 })] }));
    });

    it('turns off time bands and deactivates a hall', async () => {
      const hall = await createHall();

      const { body } = await admin.patch(`${HALLS_URL}/${hall.id}`).send({ basePrice: 35000, useTimeBands: false, isActive: false }).expect(200);

      expect(body).toMatchObject({ basePrice: 35000, useTimeBands: false, isActive: false, name: HALL_BODY.name });
    });

    it('validates the hall body', async () => {
      const response = await admin.post(cinemaHallsUrl(cinemaId)).send({ name: '', format: '', basePrice: 10.5, useTimeBands: 'yes' }).expect(400);

      expect(Object.keys(response.body.errors).sort()).toEqual(['basePrice', 'format', 'name', 'useTimeBands']);
    });

    it.each(['999999999', 'abc'])('answers 404 for the hall id %s', async (id) => {
      const response = await admin.patch(`${HALLS_URL}/${id}`).send({ name: 'Зал' }).expect(404);

      expect([HALL_MESSAGES.notFound, RECORD_NOT_FOUND_MESSAGE]).toContain(response.body.message);
    });
  });

  describe('price zones', () => {
    it('changes the multiplier of a zone', async () => {
      const zone = await createZone((await createHall()).id);

      const { body } = await admin.patch(`${PRICE_ZONES_URL}/${zone.id}`).send({ multiplier: 1.5 }).expect(200);

      expect(body).toMatchObject({ id: zone.id, name: zone.name, multiplier: 1.5 });
    });

    it('deletes an unused zone but keeps a zone that seats refer to', async () => {
      const hall = await createHall();
      const [used, unused] = [await createZone(hall.id), await createZone(hall.id, 'Пустая')];
      await admin.post(`${HALLS_URL}/${hall.id}/layouts`).send({ rows: ROWS, seats: buildUseCaseSeats(used.id) }).expect(201);

      await admin.delete(`${PRICE_ZONES_URL}/${unused.id}`).expect(204);
      const response = await admin.delete(`${PRICE_ZONES_URL}/${used.id}`).expect(409);

      expect(response.body.message).toBe(HALL_MESSAGES.priceZoneInUse);
    });
  });

  describe('layouts', () => {
    it('saves the hall from UC-04 as the first version', async () => {
      const hall = await createHall();
      const [standard, vip] = [await createZone(hall.id), await createZone(hall.id, 'Лучшие места', 1.2)];

      await admin.get(`${HALLS_URL}/${hall.id}/layout`).expect(404);
      const { body } = await admin.post(`${HALLS_URL}/${hall.id}/layouts`).send({ rows: ROWS, seats: buildUseCaseSeats(standard.id, vip.id) }).expect(201);

      expect(body).toMatchObject({ hallId: hall.id, version: 1, rows: ROWS, isCurrent: true });
      expect(body.seats).toHaveLength(ROWS * SEATS_PER_ROW);
      expect(body.seats.filter(({ type }: { type: SeatType }) => type === SeatType.Wheelchair)).toEqual([
        expect.objectContaining({ row: ROWS, number: 1 }),
        expect.objectContaining({ row: ROWS, number: SEATS_PER_ROW }),
      ]);
      expect((await admin.get(`${HALLS_URL}/${hall.id}/layout`).expect(200)).body).toEqual(body);
    });

    it('keeps the old version and makes the new one current', async () => {
      const hall = await createHall();
      const zone = await createZone(hall.id);
      const { body: first } = await admin.post(`${HALLS_URL}/${hall.id}/layouts`).send({ rows: ROWS, seats: buildUseCaseSeats(zone.id) }).expect(201);

      const { body: second } = await admin
        .post(`${HALLS_URL}/${hall.id}/layouts`)
        .send({ rows: 1, seats: [{ row: 1, number: 1, posX: 0, posY: 0, type: SeatType.Sofa, priceZoneId: zone.id }] })
        .expect(201);
      const { body: current } = await admin.get(`${HALLS_URL}/${hall.id}/layout`).expect(200);

      expect(second).toMatchObject({ version: 2, isCurrent: true });
      expect(current.id).toBe(second.id);
      expect(current.id).not.toBe(first.id);
    });

    it('rejects seats outside the rows, duplicates and a zone of another hall', async () => {
      const hall = await createHall();
      const zone = await createZone(hall.id);
      const foreignZone = await createZone((await createHall()).id);
      const seat = { row: 1, number: 1, posX: 0, posY: 0, type: SeatType.Standard, priceZoneId: zone.id };

      const response = await admin
        .post(`${HALLS_URL}/${hall.id}/layouts`)
        .send({ rows: 1, seats: [seat, { ...seat, posX: 1 }, { ...seat, row: 2, number: 2, posY: 1, priceZoneId: foreignZone.id }] })
        .expect(400);

      expect(response.body.errors).toEqual({
        'seats.1.number': [HALL_MESSAGES.duplicateSeat],
        'seats.2.row': [HALL_MESSAGES.rowOutOfRange],
        'seats.2.priceZoneId': [HALL_MESSAGES.foreignPriceZone],
      });
    });
  });

  describe('access', () => {
    it('keeps every hall operation away from an admin of another cinema', async () => {
      const hall = await createHall();
      const zone = await createZone(hall.id);
      const requests = [
        foreignAdmin.get(cinemaHallsUrl(cinemaId)),
        foreignAdmin.post(cinemaHallsUrl(cinemaId)).send(HALL_BODY),
        foreignAdmin.patch(`${HALLS_URL}/${hall.id}`).send({ name: 'Чужой' }),
        foreignAdmin.post(`${HALLS_URL}/${hall.id}/price-zones`).send({ name: 'Чужая', multiplier: 1 }),
        foreignAdmin.patch(`${PRICE_ZONES_URL}/${zone.id}`).send({ multiplier: 2 }),
        foreignAdmin.delete(`${PRICE_ZONES_URL}/${zone.id}`),
        foreignAdmin.get(`${HALLS_URL}/${hall.id}/layout`),
        foreignAdmin.post(`${HALLS_URL}/${hall.id}/layouts`).send({ rows: ROWS, seats: buildUseCaseSeats(zone.id) }),
      ];

      for (const response of await Promise.all(requests)) {
        expect(response.status).toBe(403);
        expect(response.body.message).toBe(AUTH_MESSAGES.cinemaAccessDenied);
      }
    });

    it('lets a manager see the halls for the schedule but not change them', async () => {
      const hall = await createHall();
      const manager = await loginAs(app, await createStaff(app, { role: StaffRole.Manager, cinemaIds: [cinemaId] }));

      await manager.get(cinemaHallsUrl(cinemaId)).expect(200);
      await manager.post(cinemaHallsUrl(cinemaId)).send(HALL_BODY).expect(403);
      await manager.patch(`${HALLS_URL}/${hall.id}`).send({ name: 'Зал' }).expect(403);
      await manager.get(`${HALLS_URL}/${hall.id}/layout`).expect(403);
    });

    it('keeps the halls away from a cashier', async () => {
      const cashier = await loginAs(app, await createStaff(app, { role: StaffRole.Cashier, cinemaIds: [cinemaId] }));

      await cashier.get(cinemaHallsUrl(cinemaId)).expect(403);
    });
  });
});
