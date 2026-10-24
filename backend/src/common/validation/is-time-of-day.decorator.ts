import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export const TIME_OF_DAY_MESSAGE = 'Укажите время в формате ЧЧ:ММ';

const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const IsTimeOfDay = () =>
  applyDecorators(ApiProperty({ example: '10:00', pattern: TIME_OF_DAY_PATTERN.source }), Matches(TIME_OF_DAY_PATTERN, { message: TIME_OF_DAY_MESSAGE }));
