"use client";

import Link from "next/link";
import { ROUTES, SECTION_IDS } from "@/shared/config";
import { Reveal, Section } from "@/shared/ui";
import { FILM_TEXT, FilmPoster, formatDuration, formatReleaseDate, useComingSoonFilms } from "@/entities/film";
import { COMING_SOON_POSTER_SIZES, COMING_SOON_TEXT } from "@/widgets/coming-soon/constants/coming-soon.constant";

export const ComingSoon = () => {
  const { data: films = [] } = useComingSoonFilms();

  if (films.length === 0) return null;

  return (
    <Section id={SECTION_IDS.comingSoon} title={COMING_SOON_TEXT.title}>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {films.map((film, index) => (
          <li key={film.id} className="h-full">
            <Reveal order={index} className="h-full">
              <Link href={ROUTES.film(film.id)} className="group flex h-full flex-col">
                <FilmPoster film={film} sizes={COMING_SOON_POSTER_SIZES} />
                <span className="mt-3.5 line-clamp-2 font-display text-[1.45rem] leading-[1.05] font-medium uppercase">{film.title}</span>
                <span className="mt-2 flex items-baseline justify-between gap-4 text-[0.9rem] text-paper/64">
                  <span className="truncate">{film.genre}</span>
                  <span className="shrink-0 font-mono text-[0.82rem]">{formatDuration(film.durationMinutes)}</span>
                </span>
                <span className="mt-auto pt-3 font-mono text-xs text-warm">{FILM_TEXT.releaseFrom(formatReleaseDate(film.releaseDate))}</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
};
