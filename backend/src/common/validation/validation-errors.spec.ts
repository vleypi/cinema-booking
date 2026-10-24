import { BadRequestException, type ValidationError } from '@nestjs/common';
import { collectFieldErrors, createValidationException, VALIDATION_FAILED_MESSAGE } from '@/common/validation/validation-errors.js';

const error = (property: string, constraints?: Record<string, string>, children: ValidationError[] = []): ValidationError => ({
  property,
  constraints,
  children,
});

describe('collectFieldErrors', () => {
  it('maps every invalid field to its messages', () => {
    const errors = [error('name', { isNotEmpty: 'name should not be empty' }), error('price', { min: 'price must not be less than 0', isInt: 'price must be an integer' })];

    expect(collectFieldErrors(errors)).toEqual({
      name: ['name should not be empty'],
      price: ['price must not be less than 0', 'price must be an integer'],
    });
  });

  it('builds dotted paths for nested and array fields', () => {
    const errors = [error('seats', undefined, [error('0', undefined, [error('row', { isInt: 'row must be an integer' })])])];

    expect(collectFieldErrors(errors)).toEqual({ 'seats.0.row': ['row must be an integer'] });
  });

  it('returns an empty object when there are no errors', () => {
    expect(collectFieldErrors([])).toEqual({});
  });
});

describe('createValidationException', () => {
  it('wraps field errors into a bad request with a common message', () => {
    const exception = createValidationException([error('name', { isNotEmpty: 'name should not be empty' })]);

    expect(exception).toBeInstanceOf(BadRequestException);
    expect(exception.getResponse()).toEqual({
      message: VALIDATION_FAILED_MESSAGE,
      errors: { name: ['name should not be empty'] },
    });
  });
});
