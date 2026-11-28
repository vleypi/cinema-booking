"use client";

import { SECTION_IDS } from "@/shared/config";
import { CONTAINER_CLASS_NAME, MaskedHeading, SECTION_TITLE_CLASS_NAME } from "@/shared/ui";
import { useCurrentCinema } from "@/entities/cinema";
import { useCinemaSessions } from "@/entities/session";
import { ScheduleBoard } from "@/widgets/schedule/components/ScheduleBoard";
import { SCHEDULE_TEXT } from "@/widgets/schedule/constants/schedule.constant";

const TITLE_ID = `${SECTION_IDS.schedule}-title`;

export const Schedule = () => {
  const { cinema } = useCurrentCinema();
  const { data: sessions } = useCinemaSessions(cinema?.id);

  return (
    <section
      id={SECTION_IDS.schedule}
      aria-labelledby={TITLE_ID}
      className="scroll-mt-nav bg-linear-to-b from-ink via-ink-2 to-ink px-gutter py-[clamp(3rem,5vw,4.5rem)]"
    >
      <div className={CONTAINER_CLASS_NAME}>
        <div className="mb-[clamp(1.75rem,3vw,2.75rem)]">
          <MaskedHeading id={TITLE_ID} text={SCHEDULE_TEXT.title} className={SECTION_TITLE_CLASS_NAME} />
        </div>
        {cinema && sessions ? <ScheduleBoard cinema={cinema} sessions={sessions} /> : <p className="text-paper/64">{SCHEDULE_TEXT.loading}</p>}
      </div>
    </section>
  );
};
