import type { ReactNode } from "react";
import { formatTimeInZone } from "@/shared/lib";
import { Badge } from "@/shared/ui";
import { describeFilm, FilmPoster, getPosterUrl } from "@/entities/film";
import { SESSION_STATUSES, SESSION_TEXT } from "@/entities/session/constants/session.constant";
import type { ISession } from "@/entities/session/interfaces/session.interface";

interface ISessionRowProps {
  session: ISession;
  timeZone: string;
  price: string;
  actions?: ReactNode;
}

export const SessionRow = ({ session, timeZone, price, actions }: ISessionRowProps) => (
  <div className="flex items-center gap-4 py-3">
    <div className="w-16 shrink-0 tabular-nums sm:w-20">
      <p className="text-base font-semibold text-ink">{formatTimeInZone(session.startsAt, timeZone)}</p>
      <p className="text-xs text-gray-400">
        {SESSION_TEXT.until} {formatTimeInZone(session.endsAt, timeZone)}
      </p>
    </div>
    <FilmPoster src={getPosterUrl(session.film.posterFileId)} title={session.film.title} className="w-9 shrink-0 rounded-md" />
    <div className="min-w-0 flex-1">
      <p className="line-clamp-2 font-medium text-ink">{session.film.title}</p>
      <p className="truncate text-xs text-gray-400">{describeFilm(session.film)}</p>
    </div>
    <div className="hidden shrink-0 items-center gap-2 sm:flex">
      <Badge tone="brand">{session.format}</Badge>
      {session.status === SESSION_STATUSES.cancelled && <Badge tone="danger">{SESSION_TEXT.cancelled}</Badge>}
    </div>
    <p className="hidden w-24 shrink-0 text-right text-sm text-gray-600 tabular-nums md:block">
      {price}
      <span className="block text-xs text-gray-400">{SESSION_TEXT.priceFrom}</span>
    </p>
    {actions}
  </div>
);
