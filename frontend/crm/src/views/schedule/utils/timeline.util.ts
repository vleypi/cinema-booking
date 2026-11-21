import { getMinutesFromDayStart, MINUTES_PER_HOUR } from "@/shared/lib";
import type { ISession } from "@/entities/session";
import { TIMELINE } from "@/views/schedule/constants/schedule-page.constant";

export interface ITimelineRange {
  start: number;
  end: number;
}

export interface ITimelineSpan {
  start: number;
  end: number;
}

export const toTimelineSpan = ({ startsAt, endsAt }: ISession, date: string, timeZone: string): ITimelineSpan => ({
  start: getMinutesFromDayStart(startsAt, date, timeZone),
  end: getMinutesFromDayStart(endsAt, date, timeZone),
});

export const getTimelineRange = (spans: readonly ITimelineSpan[]): ITimelineRange => ({
  start: Math.min(TIMELINE.defaultStartHour * MINUTES_PER_HOUR, ...spans.map(({ start }) => Math.floor(start / MINUTES_PER_HOUR) * MINUTES_PER_HOUR)),
  end: Math.max(TIMELINE.defaultEndHour * MINUTES_PER_HOUR, ...spans.map(({ end }) => Math.ceil(end / MINUTES_PER_HOUR) * MINUTES_PER_HOUR)),
});

export const getHourMarks = ({ start, end }: ITimelineRange): number[] =>
  Array.from({ length: (end - start) / MINUTES_PER_HOUR + 1 }, (_, index) => start + index * MINUTES_PER_HOUR);

export const toTimelinePercent = (minutes: number, { start, end }: ITimelineRange): number => ((minutes - start) / (end - start)) * 100;

export const snapToTimeline = (ratio: number, { start, end }: ITimelineRange): number =>
  Math.round((start + ratio * (end - start)) / TIMELINE.snapMinutes) * TIMELINE.snapMinutes;
