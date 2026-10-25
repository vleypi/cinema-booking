"use client";

import { joinClassNames } from "@luch/shared/lib";
import { formatRubles } from "@/shared/lib";
import { CARD_CLASS_NAME } from "@/shared/ui";
import type { IHall } from "@/entities/hall";
import { type ISession, SessionRow } from "@/entities/session";
import { RemoveSessionButton } from "@/features/remove-session";
import { SCHEDULE_PAGE_TEXT } from "@/views/schedule/constants/schedule-page.constant";

interface IHallScheduleProps {
  hall: IHall;
  sessions: readonly ISession[];
  timeZone: string;
}

export const HallSchedule = ({ hall, sessions, timeZone }: IHallScheduleProps) => (
  <section className={joinClassNames(CARD_CLASS_NAME, "min-w-0")}>
    <header className="flex items-baseline justify-between gap-3 border-b border-gray-100 px-4 py-3">
      <h2 className="font-semibold text-ink">{hall.name}</h2>
      <span className="text-xs text-gray-500">{hall.format}</span>
    </header>
    {sessions.length === 0 ? (
      <p className="px-4 py-6 text-center text-sm text-gray-500">{SCHEDULE_PAGE_TEXT.noSessions}</p>
    ) : (
      <div className="divide-y divide-gray-100 px-4">
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            timeZone={timeZone}
            price={formatRubles(session.basePriceOverride ?? hall.basePrice)}
            actions={<RemoveSessionButton sessionId={session.id} />}
          />
        ))}
      </div>
    )}
  </section>
);
