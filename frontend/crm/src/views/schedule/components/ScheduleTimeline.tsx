"use client";

import { joinClassNames } from "@luch/shared/lib";
import type { MouseEvent } from "react";
import { formatMinutesAsTime } from "@/shared/lib";
import { CARD_CLASS_NAME } from "@/shared/ui";
import type { IHall } from "@/entities/hall";
import type { ISession } from "@/entities/session";
import { SessionBlock } from "@/views/schedule/components/SessionBlock";
import { SCHEDULE_PAGE_TEXT } from "@/views/schedule/constants/schedule-page.constant";
import {
  getHourMarks,
  getTimelineRange,
  snapToTimeline,
  toTimelinePercent,
  toTimelineSpan,
} from "@/views/schedule/utils/timeline.util";

interface IScheduleTimelineProps {
  halls: readonly IHall[];
  sessions: readonly ISession[];
  date: string;
  timeZone: string;
  nowMinutes: number | null;
  onSelectSession: (session: ISession) => void;
  onCreateAt: (hallId: string, time: string) => void;
}

const ROW_CLASS_NAME = "grid grid-cols-[10rem_1fr]";

export const ScheduleTimeline = ({ halls, sessions, date, timeZone, nowMinutes, onSelectSession, onCreateAt }: IScheduleTimelineProps) => {
  const spans = new Map(sessions.map((session) => [session.id, toTimelineSpan(session, date, timeZone)]));
  const range = getTimelineRange([...spans.values()]);
  const hourMarks = getHourMarks(range);
  const showsNow = nowMinutes !== null && nowMinutes >= range.start && nowMinutes <= range.end;

  const createAtPointer = (hallId: string, event: MouseEvent<HTMLButtonElement>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    onCreateAt(hallId, formatMinutesAsTime(snapToTimeline((event.clientX - left) / width, range)));
  };

  return (
    <div className={joinClassNames(CARD_CLASS_NAME, "flex flex-1 flex-col overflow-x-auto")}>
      <div className="flex min-w-[56rem] flex-1 flex-col">
        <div className={joinClassNames(ROW_CLASS_NAME, "border-b border-gray-100")}>
          <div />
          <div className="relative h-9">
            {hourMarks.map((minutes) => (
              <span
                key={minutes}
                style={{ left: `${toTimelinePercent(minutes, range)}%` }}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500 tabular-nums last:-translate-x-full"
              >
                {formatMinutesAsTime(minutes)}
              </span>
            ))}
          </div>
        </div>
        {halls.map((hall) => (
          <div key={hall.id} className={joinClassNames(ROW_CLASS_NAME, "min-h-16 flex-1 border-b border-gray-100 last:border-b-0")}>
            <div className="flex flex-col justify-center border-r border-gray-100 px-4 py-3">
              <span className="truncate font-display font-medium text-ink">{hall.name}</span>
              <span className="truncate text-xs text-gray-500">{hall.format}</span>
            </div>
            <div className="relative">
              {hourMarks.map((minutes) => (
                <span key={minutes} style={{ left: `${toTimelinePercent(minutes, range)}%` }} className="absolute inset-y-0 w-px bg-gray-100" />
              ))}
              <button
                type="button"
                aria-label={`${SCHEDULE_PAGE_TEXT.addToHall} ${hall.name}`}
                onClick={(event) => createAtPointer(hall.id, event)}
                className="absolute inset-0 cursor-copy transition hover:bg-brand-soft/60 focus-visible:bg-brand-soft focus-visible:outline-none"
              />
              {sessions
                .filter(({ hallId }) => hallId === hall.id)
                .map((session) => (
                  <SessionBlock key={session.id} session={session} span={spans.get(session.id) ?? toTimelineSpan(session, date, timeZone)} range={range} onSelect={onSelectSession} />
                ))}
              {showsNow && <span style={{ left: `${toTimelinePercent(nowMinutes, range)}%` }} className="pointer-events-none absolute inset-y-0 z-20 w-0.5 bg-red-500/70" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
