import { joinClassNames } from "@luch/shared/lib";
import { Icon } from "@luch/shared/ui";
import Image from "next/image";
import { FILM_TEXT } from "@/entities/film/constants/film.constant";

interface IFilmPosterProps {
  src: string | null;
  title: string;
  className?: string;
}

export const FilmPoster = ({ src, title, className }: IFilmPosterProps) => (
  <div className={joinClassNames("relative aspect-2/3 overflow-hidden rounded-lg bg-gray-100", className)}>
    {src ? (
      <Image src={src} alt={title} fill unoptimized className="object-cover" />
    ) : (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-600">
        <Icon name="photo" className="size-8" />
        <span className="text-xs">{FILM_TEXT.noPoster}</span>
      </div>
    )}
  </div>
);
