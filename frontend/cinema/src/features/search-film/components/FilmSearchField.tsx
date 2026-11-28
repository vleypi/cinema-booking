"use client";

import { Icon } from "@luch/shared/ui";
import { SEARCH_FILM_TEXT } from "@/features/search-film/constants/search-film.constant";

interface IFilmSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const FilmSearchField = ({ value, onChange }: IFilmSearchFieldProps) => (
  <label className="relative block max-w-80">
    <span className="sr-only">{SEARCH_FILM_TEXT.label}</span>
    <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-paper/38" />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={SEARCH_FILM_TEXT.placeholder}
      className="min-h-10.5 w-full rounded-full border border-paper/13 bg-transparent pr-4 pl-10 transition-colors placeholder:text-paper/38 hover:border-paper/28 focus:border-paper focus:outline-none"
    />
  </label>
);
