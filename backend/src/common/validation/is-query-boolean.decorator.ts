import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

const QUERY_BOOLEANS: Record<string, boolean> = { true: true, false: false };

export const IsQueryBoolean = () =>
  applyDecorators(
    Transform(({ value }: { value: unknown }) => (typeof value === 'string' && value in QUERY_BOOLEANS ? QUERY_BOOLEANS[value] : value)),
    IsBoolean(),
  );
