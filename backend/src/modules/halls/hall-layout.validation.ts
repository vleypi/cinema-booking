import type { FieldErrors } from '@/common/validation/validation-errors.js';
import type { CreateHallLayoutDto } from '@/modules/halls/dto/create-hall-layout.dto.js';
import { HALL_MESSAGES } from '@/modules/halls/halls.constant.js';

export const findLayoutErrors = ({ rows, seats }: CreateHallLayoutDto, priceZoneIds: string[]): FieldErrors => {
  const errors: FieldErrors = {};
  const seatKeys = new Set<string>();
  const positionKeys = new Set<string>();
  const addError = (index: number, field: string, message: string) => (errors[`seats.${index}.${field}`] ??= []).push(message);

  seats.forEach(({ row, number, posX, posY, priceZoneId }, index) => {
    const seatKey = `${row}:${number}`;
    const positionKey = `${posX}:${posY}`;

    if (row > rows) addError(index, 'row', HALL_MESSAGES.rowOutOfRange);
    if (seatKeys.has(seatKey)) addError(index, 'number', HALL_MESSAGES.duplicateSeat);
    if (positionKeys.has(positionKey)) addError(index, 'posX', HALL_MESSAGES.duplicatePosition);
    if (!priceZoneIds.includes(priceZoneId)) addError(index, 'priceZoneId', HALL_MESSAGES.foreignPriceZone);

    seatKeys.add(seatKey);
    positionKeys.add(positionKey);
  });

  return errors;
};
