import type { IFilm } from "@luch/shared/film";
import Link from "next/link";
import { ROUTES } from "@/shared/config";
import { FilmPoster, formatDuration } from "@/entities/film";
import { AFISHA_TEXT, POSTER_SIZES } from "@/widgets/afisha/constants/afisha.constant";

interface IPosterCardProps {
  film: IFilm;
}

export const PosterCard = ({ film }: IPosterCardProps) => (
  <Link href={ROUTES.film(film.id)} className="group flex h-full flex-col">
    <FilmPoster film={film} sizes={POSTER_SIZES} />
    <span className="mt-3.5 line-clamp-2 font-display text-[1.45rem] leading-[1.05] font-medium uppercase">{film.title}</span>
    <span className="mt-2 flex items-baseline justify-between gap-4 text-[0.9rem] text-paper/64">
      <span className="truncate">{film.genre}</span>
      <span className="shrink-0 font-mono text-[0.82rem]">{formatDuration(film.durationMinutes)}</span>
    </span>
    <span className="mt-1.5 line-clamp-2 text-[0.9rem] text-paper/64">{film.description}</span>
    <span className="mt-auto inline-flex gap-1.5 pt-3 text-[0.9rem] opacity-55 transition-[opacity,gap] duration-350 ease-out-expo group-hover:gap-3 group-hover:opacity-100 group-focus-visible:opacity-100">
      {AFISHA_TEXT.sessions}
      <span aria-hidden>→</span>
    </span>
  </Link>
);
