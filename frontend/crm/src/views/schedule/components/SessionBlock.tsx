import { joinClassNames } from "@luch/shared/lib";
import { formatMinutesAsTime } from "@/shared/lib";
import { type ISession, SESSION_STATUSES } from "@/entities/session";
import { CANCELLED_SESSION_CLASS_NAME, SCHEDULE_PAGE_TEXT, SESSION_BLOCK_COLORS } from "@/views/schedule/constants/schedule-page.constant";
import { type ITimelineRange, type ITimelineSpan, toTimelinePercent } from "@/views/schedule/utils/timeline.util";

interface ISessionBlockProps {
  session: ISession;
  span: ITimelineSpan;
  range: ITimelineRange;
  onSelect: (session: ISession) => void;
}

export const SessionBlock = ({ session, span, range, onSelect }: ISessionBlockProps) => {
  const left = toTimelinePercent(span.start, range);
  const width = toTimelinePercent(span.end, range) - left;
  const colorClassName =
    session.status === SESSION_STATUSES.cancelled ? CANCELLED_SESSION_CLASS_NAME : SESSION_BLOCK_COLORS[Number(session.filmId) % SESSION_BLOCK_COLORS.length];

  return (
    <button
      type="button"
      onClick={() => onSelect(session)}
      title={`${formatMinutesAsTime(span.start)} ${session.film.title}`}
      style={{ left: `${left}%`, width: `${width}%` }}
      className={joinClassNames(
        "absolute inset-y-1.5 z-10 flex flex-col justify-start gap-0.5 py-2 overflow-hidden rounded-lg px-2.5 text-left text-xs leading-tight shadow-sm transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:outline-none",
        colorClassName,
      )}
    >
      <span className="line-clamp-2 font-semibold">
        {formatMinutesAsTime(span.start)} {session.film.title}
      </span>
      <span className="truncate opacity-75">
        {SCHEDULE_PAGE_TEXT.until} {formatMinutesAsTime(span.end)} · {session.format}
      </span>
    </button>
  );
};
