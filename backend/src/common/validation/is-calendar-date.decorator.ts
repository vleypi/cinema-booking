import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, Matches } from 'class-validator';

export const CALENDAR_DATE_MESSAGE = 'Укажите дату в формате ГГГГ-ММ-ДД';

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const IsCalendarDate = () =>
  applyDecorators(
    ApiProperty({ example: '2026-10-25', format: 'date' }),
    Matches(CALENDAR_DATE_PATTERN, { message: CALENDAR_DATE_MESSAGE }),
    IsISO8601({ strict: true }, { message: CALENDAR_DATE_MESSAGE }),
  );
