"use client";

import { Button, Icon, Modal } from "@luch/shared/ui";
import { useState } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { EmptyState, PageHeader } from "@/shared/ui";
import { isSchedulable, useFilms } from "@/entities/film";
import { useCinemaHalls } from "@/entities/hall";
import { useCinemaSessions } from "@/entities/session";
import { SessionForm } from "@/features/create-session";
import { DayPicker } from "@/views/schedule/components/DayPicker";
import { HallSchedule } from "@/views/schedule/components/HallSchedule";
import { SCHEDULE_PAGE_TEXT } from "@/views/schedule/constants/schedule-page.constant";
import { useScheduleDay } from "@/views/schedule/hooks/useScheduleDay";

interface ICinemaScheduleSectionProps {
  cinema: ICinemaSummary;
}

export const CinemaScheduleSection = ({ cinema }: ICinemaScheduleSectionProps) => {
  const day = useScheduleDay(cinema.timezone);
  const [isCreating, setIsCreating] = useState(false);
  const { data: halls, isPending: areHallsPending } = useCinemaHalls(cinema.id);
  const { data: sessions, isPending: areSessionsPending } = useCinemaSessions(cinema.id, day.date);
  const { data: films } = useFilms();
  const shownHalls = halls?.filter((hall) => hall.isActive || sessions?.some(({ hallId }) => hallId === hall.id)) ?? [];

  return (
    <>
      <PageHeader
        title={SCHEDULE_PAGE_TEXT.title}
        description={`${SCHEDULE_PAGE_TEXT.description}: ${cinema.name}`}
        actions={
          <Button onClick={() => setIsCreating(true)}>
            <Icon name="plus" className="size-4" />
            {SCHEDULE_PAGE_TEXT.add}
          </Button>
        }
      />
      <DayPicker
        date={day.date}
        isToday={day.isToday}
        onChange={day.setDate}
        onPrevious={day.showPrevious}
        onNext={day.showNext}
        onToday={day.showToday}
      />
      {(areHallsPending || areSessionsPending) && <div className="h-64 animate-pulse rounded-xl bg-gray-100" />}
      {!areHallsPending && shownHalls.length === 0 && (
        <EmptyState icon="seats" title={SCHEDULE_PAGE_TEXT.noHallsTitle} description={SCHEDULE_PAGE_TEXT.noHallsDescription} />
      )}
      {!areHallsPending && !areSessionsPending && (
        <div className="grid gap-4 xl:grid-cols-2">
          {shownHalls.map((hall) => (
            <HallSchedule key={hall.id} hall={hall} sessions={sessions?.filter(({ hallId }) => hallId === hall.id) ?? []} timeZone={cinema.timezone} />
          ))}
        </div>
      )}
      <Modal isOpen={isCreating} title={SCHEDULE_PAGE_TEXT.createTitle} onClose={() => setIsCreating(false)}>
        <SessionForm
          cinemaId={cinema.id}
          date={day.date}
          films={films?.filter(isSchedulable) ?? []}
          halls={halls?.filter(({ isActive }) => isActive) ?? []}
          onDone={(date) => {
            day.setDate(date);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      </Modal>
    </>
  );
};
