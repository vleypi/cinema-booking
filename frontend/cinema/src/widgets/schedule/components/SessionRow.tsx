import { formatRubles, formatTimeInZone } from "@luch/shared/lib";
import Link from "next/link";
import { ROUTES } from "@/shared/config";
import { ButtonLink } from "@/shared/ui";
import { describeFilm } from "@/entities/film";
import { type ISession, SESSION_TEXT } from "@/entities/session";
import { SCHEDULE_TEXT } from "@/widgets/schedule/constants/schedule.constant";

interface ISessionRowProps {
  session: ISession;
  timeZone: string;
}

export const SessionRow = ({ session, timeZone }: ISessionRowProps) => {
  const time = formatTimeInZone(session.startsAt, timeZone);
  const price = formatRubles(session.minPrice);

  return (
    <li className="grid grid-cols-[4.6rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 border-b border-paper/13 px-2 py-5 transition-colors duration-200 hover:bg-paper/4 lg:grid-cols-[6.2rem_minmax(0,1fr)_11rem_8.5rem_10rem] lg:gap-x-6 lg:gap-y-0">
      <span className="row-span-3 font-display text-[1.4rem] leading-none font-medium tabular-nums lg:row-span-1 lg:text-[clamp(1.5rem,2.4vw,2.1rem)]">
        {time}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Link href={ROUTES.film(session.filmId)} className="truncate text-[1.12rem] font-medium tracking-[-0.01em] transition-colors hover:text-warm">
          {session.film.title}
        </Link>
        <span className="text-[0.8rem] text-paper/38 lg:text-[0.86rem]">{describeFilm(session.film)}</span>
      </div>
      <div className="text-[0.92rem] text-paper/64 max-lg:col-start-2">
        <b className="mr-1.5 font-medium text-paper lg:mr-0 lg:block">{session.hall.name}</b>
        <span>{session.format}</span>
      </div>
      <div className="font-mono text-base font-medium text-paper max-lg:col-start-2">{SESSION_TEXT.priceFrom(price)}</div>
      <ButtonLink
        href={ROUTES.film(session.filmId)}
        size="small"
        aria-label={SCHEDULE_TEXT.buyLabel(session.film.title, time)}
        className="justify-self-end max-lg:col-start-3 max-lg:row-start-1 max-lg:row-end-4"
      >
        {SCHEDULE_TEXT.buy}
      </ButtonLink>
    </li>
  );
};
