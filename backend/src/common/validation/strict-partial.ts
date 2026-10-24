import type { Type } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';

export const StrictPartialType = <T>(classRef: Type<T>) => PartialType(classRef, { skipNullProperties: false });

export const IsOptionalNonNull = () => ValidateIf((_: object, value: unknown) => value !== undefined);
