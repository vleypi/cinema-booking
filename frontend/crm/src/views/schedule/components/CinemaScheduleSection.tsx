"use client";

import { Button, Modal } from "@luch/shared/ui";
import { useState } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { PERMISSIONS } from "@/shared/config";
import { formatRubles, getMinutesFromDayStart } from "@/shared/lib";
import { EmptyState, PageHeader } from "@/shared/ui";
import { useSchedulableFilms } from "@/entities/film";
import { useCinemaHalls } from "@/entities/hall";
import { type ISession, SessionRow, useCinemaSessions } from "@/entities/session";
import { hasPermission, useViewer } from "@/entities/viewer";
import { CANCEL_SESSION_TEXT, CancelSessionModal } from "@/features/cancel-session";
import { SessionForm } from "@/features/create-session";
import { RemoveSessionButton } from "@/features/remove-session";
import { DayPicker } from "@/views/schedule/components/DayPicker";
import { ScheduleTimeline } from "@/views/schedule/components/ScheduleTimeline";
import { SCHEDULE_PAGE_TEXT, TIMELINE } from "@/views/schedule/constants/schedule-page.constant";
import { useScheduleDay } from "@/views/schedule/hooks/useScheduleDay";

interface ICinemaScheduleSectionProps {
  cinema: ICinemaSummary;
}

interface ISessionDraft {
  hallId?: string;
  time: string;
}

export const CinemaScheduleSection = ({ cinema }: ICinemaScheduleSectionProps) => {
  const day = useScheduleDay(cinema.timezone);
  const [nowMinutes] = useState(() => getMinutesFromDayStart(new Date(), day.today, cinema.timezone));
  const [draft, setDraft] = useState<ISessionDraft | null>(null);
  const [selectedSession, setSelectedSession] = useState<ISession | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ISession | null>(null);
  const { data: viewer } = useViewer();
  const canCancelSessions = hasPermission(viewer, PERMISSIONS.cancelSessions);
  const { data: halls, isPending: areHallsPending } = useCinemaHalls(cinema.id);
  const { data: sessions, isPending: areSessionsPending } = useCinemaSessions(cinema.id, day.date);
  const films = useSchedulableFilms();
  const shownHalls = halls?.filter((hall) => hall.isActive || sessions?.some(({ hallId }) => hallId === hall.id)) ?? [];
  const selectedHall = halls?.find(({ id }) => id === selectedSession?.hallId);

  return (
    <>
      <PageHeader title={SCHEDULE_PAGE_TEXT.title} add={{ label: SCHEDULE_PAGE_TEXT.add, onClick: () => setDraft({ time: TIMELINE.defaultCreateTime }) }} />
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
      {!areHallsPending && !areSessionsPending && shownHalls.length > 0 && (
        <ScheduleTimeline
          halls={shownHalls}
          sessions={sessions ?? []}
          date={day.date}
          timeZone={cinema.timezone}
          nowMinutes={day.isToday ? nowMinutes : null}
          onSelectSession={setSelectedSession}
          onCreateAt={(hallId, time) => setDraft({ hallId, time })}
        />
      )}
      <Modal size="lg" isOpen={draft !== null} title={SCHEDULE_PAGE_TEXT.createTitle} onClose={() => setDraft(null)}>
        <SessionForm
          cinemaId={cinema.id}
          date={day.date}
          films={films}
          halls={halls?.filter(({ isActive }) => isActive) ?? []}
          initialHallId={draft?.hallId}
          initialTime={draft?.time}
          onDone={(date) => {
            day.setDate(date);
            setDraft(null);
          }}
          onCancel={() => setDraft(null)}
        />
      </Modal>
      <Modal isOpen={selectedSession !== null} title={SCHEDULE_PAGE_TEXT.sessionTitle} onClose={() => setSelectedSession(null)}>
        {selectedSession && (
          <div className="pb-6">
            <SessionRow
              session={selectedSession}
              timeZone={cinema.timezone}
              price={formatRubles(selectedSession.basePriceOverride ?? selectedHall?.basePrice ?? 0)}
              actions={
                <div className="flex items-center gap-2">
                  {canCancelSessions && selectedSession.status === "SCHEDULED" && (
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setCancelTarget(selectedSession);
                        setSelectedSession(null);
                      }}
                    >
                      {CANCEL_SESSION_TEXT.buttonLabel}
                    </Button>
                  )}
                  <RemoveSessionButton sessionId={selectedSession.id} onRemoved={() => setSelectedSession(null)} />
                </div>
              }
            />
            {selectedHall && (
              <p className="mt-1 text-sm text-gray-500">
                {selectedHall.name} · {selectedHall.format}
              </p>
            )}
          </div>
        )}
      </Modal>
      <CancelSessionModal
        key={cancelTarget?.id ?? "closed"}
        session={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={() => setCancelTarget(null)}
      />
    </>
  );
};
