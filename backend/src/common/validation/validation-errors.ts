import { BadRequestException, type ValidationError } from '@nestjs/common';

export const VALIDATION_FAILED_MESSAGE = 'Ошибка валидации';

export type FieldErrors = Record<string, string[]>;

export const collectFieldErrors = (errors: ValidationError[], parentPath = ''): FieldErrors =>
  errors.reduce<FieldErrors>((fieldErrors, error) => {
    const path = parentPath ? `${parentPath}.${error.property}` : error.property;
    const ownErrors = error.constraints ? { [path]: Object.values(error.constraints) } : {};

    return { ...fieldErrors, ...ownErrors, ...collectFieldErrors(error.children ?? [], path) };
  }, {});

export const createValidationException = (errors: ValidationError[]) =>
  new BadRequestException({ message: VALIDATION_FAILED_MESSAGE, errors: collectFieldErrors(errors) });

export const fieldError = (field: string, message: string) => ({ message: VALIDATION_FAILED_MESSAGE, errors: { [field]: [message] } });

export const invalidField = (field: string, message: string) => new BadRequestException(fieldError(field, message));
