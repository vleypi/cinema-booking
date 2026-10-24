import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Max } from 'class-validator';
import { MULTIPLIER_SCALE } from '@/common/database/columns.js';

export const MULTIPLIER_MAX = 5;

export const IsMultiplier = () =>
  applyDecorators(
    ApiProperty({ example: 1.2, maximum: MULTIPLIER_MAX }),
    IsNumber({ maxDecimalPlaces: MULTIPLIER_SCALE }),
    IsPositive(),
    Max(MULTIPLIER_MAX),
  );
