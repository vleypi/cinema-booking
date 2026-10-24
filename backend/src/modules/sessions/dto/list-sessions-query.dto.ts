import { IsCalendarDate } from '@/common/validation/is-calendar-date.decorator.js';

export class ListSessionsQueryDto {
  @IsCalendarDate()
  date: string;
}
