import { API_PREFIX } from '@/app.setup.js';
import { SeatType } from '@/modules/halls/seat-type.enum.js';
import type { StaffAgent } from '@test/support/auth.helpers.js';

export const HALLS_URL = `/${API_PREFIX}/halls`;
export const cinemaHallsUrl = (cinemaId: string) => `/${API_PREFIX}/cinemas/${cinemaId}/halls`;

export const HALL_BODY = { name: 'Зал 1', format: 'Лазер 4K', basePrice: 40000, useTimeBands: true };
export const ROWS = 7;
export const SEATS_PER_ROW = 10;

const AISLE_AFTER_SEAT = 5;

export interface IHallWithLayout {
  hallId: string;
  layoutId: string;
  priceZoneId: string;
}

export const buildUseCaseSeats = (priceZoneId: string, vipZoneId = priceZoneId) =>
  Array.from({ length: ROWS * SEATS_PER_ROW }, (_, index) => {
    const row = Math.floor(index / SEATS_PER_ROW) + 1;
    const number = (index % SEATS_PER_ROW) + 1;
    const isWheelchair = row === ROWS && (number === 1 || number === SEATS_PER_ROW);

    return {
      row,
      number,
      posX: number > AISLE_AFTER_SEAT ? number : number - 1,
      posY: row - 1,
      type: isWheelchair ? SeatType.Wheelchair : SeatType.Standard,
      priceZoneId: row > ROWS / 2 ? vipZoneId : priceZoneId,
    };
  });

export const createHallWithLayout = async (admin: StaffAgent, cinemaId: string): Promise<IHallWithLayout> => {
  const { body: hall } = await admin.post(cinemaHallsUrl(cinemaId)).send(HALL_BODY).expect(201);
  const { body: zone } = await admin.post(`${HALLS_URL}/${hall.id}/price-zones`).send({ name: 'Обычные места', multiplier: 1 }).expect(201);
  const { body: layout } = await admin.post(`${HALLS_URL}/${hall.id}/layouts`).send({ rows: ROWS, seats: buildUseCaseSeats(zone.id) }).expect(201);

  return { hallId: hall.id, layoutId: layout.id, priceZoneId: zone.id };
};
