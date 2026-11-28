import { getPosterUrl, type IFilm } from "@luch/shared/film";
import { joinClassNames } from "@luch/shared/lib";
import Image from "next/image";
import { FILM_TEXT } from "@/entities/film/constants/film.constant";

interface IFilmPosterProps {
  film: IFilm;
  sizes: string;
  className?: string;
}

const BADGE_CLASS_NAME = "absolute top-3 z-2 rounded-xs px-2 py-1 font-mono text-[0.72rem] tracking-[0.04em]";

export const FilmPoster = ({ film, sizes, className }: IFilmPosterProps) => {
  const posterUrl = getPosterUrl(film.posterFileId);

  return (
    <span className={joinClassNames("relative block aspect-2/3 overflow-hidden rounded-frame bg-ink-3", className)}>
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={film.title}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-900 ease-out-expo group-hover:scale-103"
        />
      ) : (
        <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-5xl text-paper/13 uppercase">
          {FILM_TEXT.noPoster}
        </span>
      )}
      {film.isPremiere && <span className={joinClassNames(BADGE_CLASS_NAME, "left-3 bg-signal text-paper uppercase")}>{FILM_TEXT.premiere}</span>}
      <span className={joinClassNames(BADGE_CLASS_NAME, "right-3 bg-black/60")}>{film.ageRating}</span>
    </span>
  );
};
