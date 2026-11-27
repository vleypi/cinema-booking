import { joinClassNames } from "@luch/shared/lib";
import type { ReactNode } from "react";
import { MaskedHeading } from "@/shared/ui/MaskedHeading";
import { CONTAINER_CLASS_NAME, SECTION_NOTE_CLASS_NAME, SECTION_TITLE_CLASS_NAME } from "@/shared/ui/ui.constant";

interface ISectionProps {
  id?: string;
  title: string;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const Section = ({ id, title, note, className, children }: ISectionProps) => {
  const titleId = id && `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className={joinClassNames("scroll-mt-nav px-gutter py-[clamp(3rem,5vw,4.5rem)]", className)}>
      <div className={CONTAINER_CLASS_NAME}>
        <div className="mb-[clamp(1.75rem,3vw,2.75rem)] flex flex-wrap items-end justify-between gap-x-16 gap-y-8">
          <MaskedHeading id={titleId} text={title} className={SECTION_TITLE_CLASS_NAME} />
          {note && <p className={SECTION_NOTE_CLASS_NAME}>{note}</p>}
        </div>
        {children}
      </div>
    </section>
  );
};
