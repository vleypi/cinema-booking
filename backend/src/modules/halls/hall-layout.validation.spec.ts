import type { SeatInputDto } from '@/modules/halls/dto/create-hall-layout.dto.js';
import { findLayoutErrors } from '@/modules/halls/hall-layout.validation.js';
import { HALL_MESSAGES } from '@/modules/halls/halls.constant.js';
import { SeatType } from '@/modules/halls/seat-type.enum.js';

const ZONE_ID = '1';

const seat = (row: number, number: number, overrides: Partial<SeatInputDto> = {}): SeatInputDto => ({
  row,
  number,
  posX: number,
  posY: row,
  type: SeatType.Standard,
  priceZoneId: ZONE_ID,
  ...overrides,
});

describe('findLayoutErrors', () => {
  it('accepts a layout with an aisle and a wheelchair place', () => {
    const seats = [seat(1, 1), seat(1, 2, { posX: 4 }), seat(2, 1, { type: SeatType.Wheelchair })];

    expect(findLayoutErrors({ rows: 2, seats }, [ZONE_ID])).toEqual({});
  });

  it('reports every broken seat by its path', () => {
    const seats = [seat(1, 1), seat(1, 1, { posX: 5 }), seat(1, 2, { posX: 1, posY: 1 }), seat(3, 1, { priceZoneId: '99' })];

    expect(findLayoutErrors({ rows: 2, seats }, [ZONE_ID])).toEqual({
      'seats.1.number': [HALL_MESSAGES.duplicateSeat],
      'seats.2.posX': [HALL_MESSAGES.duplicatePosition],
      'seats.3.row': [HALL_MESSAGES.rowOutOfRange],
      'seats.3.priceZoneId': [HALL_MESSAGES.foreignPriceZone],
    });
  });
});
