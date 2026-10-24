import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';

export const INVALID_ID_MESSAGE = 'Некорректный идентификатор';

const ID_PATTERN = /^[1-9]\d{0,18}$/;

@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!ID_PATTERN.test(value)) throw new BadRequestException(INVALID_ID_MESSAGE);

    return value;
  }
}
