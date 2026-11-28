"use client";

import Link from "next/link";
import { ROUTES } from "@/shared/config";
import { ButtonArrow, ButtonLink, CONTAINER_CLASS_NAME } from "@/shared/ui";
import { describeFilm, FILM_TEXT, FilmPoster, formatReleaseDate, useFilm } from "@/entities/film";
import { FilmSessions } from "@/views/film/components/FilmSessions";
import { FILM_PAGE_POSTER_SIZES, FILM_PAGE_TEXT } from "@/views/film/constants/film-page.constant";

interface IFilmViewProps {
  filmId: string;
}

export const FilmView = ({ filmId }: IFilmViewProps) => {
  const { data: film, isPending } = useFilm(filmId);

  return (
    <section className="min-h-svh px-gutter pt-[calc(var(--spacing-nav)+2rem)] pb-[clamp(3rem,5vw,4.5rem)]">
      <div className={CONTAINER_CLASS_NAME}>
        <Link href={ROUTES.home} className="inline-flex min-h-11 items-center font-mono text-sm text-paper/64 transition-colors hover:text-paper">
          ← {FILM_PAGE_TEXT.back}
        </Link>
        {!film ? (
          <p className="mt-8 text-paper/64">{isPending ? FILM_PAGE_TEXT.loading : FILM_PAGE_TEXT.notFound}</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 items-start gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <aside className="flex flex-col items-start">
              <FilmPoster film={film} sizes={FILM_PAGE_POSTER_SIZES} className="w-full max-lg:max-w-72" />
              <h1 className="mt-5 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.02] font-medium uppercase">{film.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
                <span className="text-paper/64">{describeFilm(film)}</span>
                <span className="text-warm">{FILM_TEXT.releaseFrom(formatReleaseDate(film.releaseDate))}</span>
              </div>
              <p className="mt-4 text-[0.95rem] leading-relaxed whitespace-pre-line text-paper/64">{film.description}</p>
              {film.trailerUrl && (
                <ButtonLink href={film.trailerUrl} target="_blank" rel="noopener noreferrer" variant="ghost" size="small" className="mt-6">
                  {FILM_PAGE_TEXT.trailer}
                  <ButtonArrow />
                </ButtonLink>
              )}
            </aside>
            <FilmSessions filmId={film.id} />
          </div>
        )}
      </div>
    </section>
  );
};
