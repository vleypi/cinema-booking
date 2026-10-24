import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { fieldError } from '@/common/validation/validation-errors.js';

const UNIQUE_VIOLATION_CODE = '23505';

export const rethrowUniqueViolation =
  (field: string, message: string) =>
  (error: unknown): never => {
    if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === UNIQUE_VIOLATION_CODE) {
      throw new ConflictException(fieldError(field, message));
    }

    throw error;
  };
