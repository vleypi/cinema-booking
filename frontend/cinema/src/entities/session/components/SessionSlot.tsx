import { formatRubles, formatTimeInZone, joinClassNames } from "@luch/shared/lib";
import { PANEL_CLASS_NAME } from "@/shared/ui";
import { SESSION_TEXT } from "@/entities/session/constants/session.constant";
import type { ISession } from "@/entities/session/interfaces/session.interface";

interface ISessionSlotProps {
  session: ISession;
  timeZone: string;
}

export const SessionSlot = ({ session, timeZone }: ISessionSlotProps) => {
  const time = formatTimeInZone(session.startsAt, timeZone);
  const price = formatRubles(session.minPrice);

  return (
    <div
      aria-label={SESSION_TEXT.slotLabel(time, session.hall.name, price)}
      className={joinClassNames(PANEL_CLASS_NAME, "grid min-w-[calc(50%-0.3rem)] gap-0.5 bg-ink-2 px-3.5 pt-3 pb-3.5 sm:min-w-34")}
    >
      <span className="font-display text-[1.65rem] leading-none font-medium">{time}</span>
      <span className="text-[0.82rem] text-paper/64">{session.hall.name}</span>
      <span className="font-mono text-[0.78rem]">{SESSION_TEXT.priceFrom(price)}</span>
    </div>
  );
};
