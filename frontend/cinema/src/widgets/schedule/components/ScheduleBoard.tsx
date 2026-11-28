"use client";

import { Button } from "@/shared/ui";
import type { ICinema } from "@/entities/cinema";
import type { ISession } from "@/entities/session";
import { DayTabs, FILTER_SCHEDULE_TEXT, FilmFilter, HallFilter, useScheduleFilters } from "@/features/filter-schedule";
import { SessionRow } from "@/widgets/schedule/components/SessionRow";

interface IScheduleBoardProps {
  cinema: ICinema;
  sessions: readonly ISession[];
}

export const ScheduleBoard = ({ cinema, sessions }: IScheduleBoardProps) => {
  const schedule = useScheduleFilters(sessions, cinema.timezone);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <DayTabs days={schedule.days} selected={schedule.date} onSelect={schedule.selectDate} />
        <div className="flex flex-wrap gap-3">
          <FilmFilter options={schedule.filmOptions} value={schedule.filmId} onChange={schedule.selectFilm} />
          <HallFilter options={schedule.hallOptions} value={schedule.hallId} onChange={schedule.selectHall} />
        </div>
      </div>
      <ol aria-live="polite" className="border-t border-paper/13">
        {schedule.visibleSessions.length === 0 ? (
          <li className="grid justify-items-start gap-4 py-12 text-paper/64">
            <p>{schedule.isFiltered ? FILTER_SCHEDULE_TEXT.emptyFiltered : FILTER_SCHEDULE_TEXT.emptyDay}</p>
            <Button variant="ghost" size="small" onClick={schedule.reset}>
              {FILTER_SCHEDULE_TEXT.reset}
            </Button>
          </li>
        ) : (
          schedule.visibleSessions.map((session) => <SessionRow key={session.id} session={session} timeZone={cinema.timezone} />)
        )}
      </ol>
    </>
  );
};
