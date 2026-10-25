import { Badge } from "@/shared/ui";
import { FilmPoster } from "@/entities/film/components/FilmPoster";
import { FILM_STATUS_LABELS, FILM_STATUS_TONES, FILM_TEXT } from "@/entities/film/constants/film.constant";
import type { IFilm } from "@/entities/film/interfaces/film.interface";
import { describeFilm, getPosterUrl } from "@/entities/film/utils/film.util";

interface IFilmCardProps {
  film: IFilm;
  onSelect: (film: IFilm) => void;
}

export const FilmCard = ({ film, onSelect }: IFilmCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(film)}
    className="group flex flex-col gap-3 rounded-xl text-left focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
  >
    <div className="relative">
      <FilmPoster src={getPosterUrl(film.posterFileId)} title={film.title} className="transition group-hover:opacity-90" />
      {film.isPremiere && (
        <span className="absolute top-2 left-2 rounded-md bg-ray px-2 py-0.5 text-xs font-semibold text-ink">{FILM_TEXT.premiere}</span>
      )}
    </div>
    <div className="flex flex-col items-start gap-1.5">
      <p className="line-clamp-2 font-semibold text-ink">{film.title}</p>
      <p className="text-xs text-gray-500">{describeFilm(film)}</p>
      <Badge tone={FILM_STATUS_TONES[film.status]}>{FILM_STATUS_LABELS[film.status]}</Badge>
    </div>
  </button>
);
