"use client";

import { formatRubles, formatTimeInZone } from "@luch/shared/lib";
import Link from "next/link";
import { ROUTES } from "@/shared/config";
import { Button, MaskedHeading } from "@/shared/ui";
import { useCurrentCinema } from "@/entities/cinema";
import { SESSION_TEXT, useCinemaSessions } from "@/entities/session";
import { DayTabs, FILTER_SCHEDULE_TEXT, HallFilter, useScheduleFilters } from "@/features/filter-schedule";
import { FILM_PAGE_TEXT } from "@/views/film/constants/film-page.constant";

interface IFilmSessionsProps {
  filmId: string;
}

export const FilmSessions = ({ filmId }: IFilmSessionsProps) => {
  const { cinema } = useCurrentCinema();
  const { data: sessions = [] } = useCinemaSessions(cinema?.id);
  const filmSessions = sessions.filter((session) => session.filmId === filmId);
  const schedule = useScheduleFilters(filmSessions, cinema?.timezone ?? "UTC");

  if (!cinema) return null;

  return (
    <section className="min-w-0">
      <div className="mb-6">
        <MaskedHeading text={FILM_PAGE_TEXT.sessionsTitle(cinema.name)} className="font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-none font-medium uppercase" />
      </div>
      {filmSessions.length === 0 ? (
        <p className="border-t border-paper/13 py-10 text-paper/64">{FILM_PAGE_TEXT.noSessions}</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <DayTabs days={schedule.days} selected={schedule.date} onSelect={schedule.selectDate} />
            {schedule.hallOptions.length > 1 && (
              <HallFilter options={schedule.hallOptions} value={schedule.hallId} onChange={schedule.selectHall} />
            )}
          </div>
          <ol aria-live="polite" className="border-t border-paper/13">
            {schedule.visibleSessions.length === 0 ? (
              <li className="grid justify-items-start gap-4 py-10 text-paper/64">
                <p>{schedule.isFiltered ? FILTER_SCHEDULE_TEXT.emptyFiltered : FILTER_SCHEDULE_TEXT.emptyDay}</p>
                <Button variant="ghost" size="small" onClick={schedule.reset}>
                  {FILTER_SCHEDULE_TEXT.reset}
                </Button>
              </li>
            ) : (
              schedule.visibleSessions.map((session) => {
                const time = formatTimeInZone(session.startsAt, cinema.timezone);
                const price = formatRubles(session.minPrice);

                return (
                  <li key={session.id} className="border-b border-paper/13">
                    <Link
                      href={ROUTES.session(session.id)}
                      className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-x-6 px-2 py-5 transition-colors duration-200 hover:bg-paper/4 lg:grid-cols-[6.2rem_minmax(0,1fr)_10rem]"
                    >
                      <span className="font-display text-[1.4rem] leading-none font-medium tabular-nums lg:text-[clamp(1.5rem,2.4vw,2.1rem)]">
                        {time}
                      </span>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[0.95rem]">
                        <b className="font-medium text-paper">{session.hall.name}</b>
                        <span className="font-mono text-xs text-paper/64">{session.format}</span>
                      </div>
                      <span className="justify-self-end font-mono text-base font-medium text-paper">{SESSION_TEXT.priceFrom(price)}</span>
                    </Link>
                  </li>
                );
              })
            )}
          </ol>
        </>
      )}
    </section>
  );
};
