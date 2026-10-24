import { Injectable, NotFoundException, type PipeTransform } from '@nestjs/common';

export const RECORD_NOT_FOUND_MESSAGE = 'Запись не найдена';

const ID_PATTERN = /^[1-9]\d{0,17}$/;

export const isId = (value: string): boolean => ID_PATTERN.test(value);

@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isId(value)) throw new NotFoundException(RECORD_NOT_FOUND_MESSAGE);

    return value;
  }
}
