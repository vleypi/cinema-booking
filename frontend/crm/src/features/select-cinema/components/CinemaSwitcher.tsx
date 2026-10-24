"use client";

import { useCurrentCinema, useViewer } from "@/entities/viewer";
import { SELECT_CINEMA_TEXT } from "@/features/select-cinema/constants/select-cinema.constant";

const SINGLE_CINEMA_COUNT = 1;

export const CinemaSwitcher = () => {
  const { data: viewer } = useViewer();
  const { cinema, select } = useCurrentCinema();
  const cinemas = viewer?.cinemas ?? [];

  if (!cinema) return null;
  if (cinemas.length === SINGLE_CINEMA_COUNT) return <span className="truncate text-sm font-medium text-ink">{cinema.name}</span>;

  return (
    <select
      aria-label={SELECT_CINEMA_TEXT.label}
      value={cinema.id}
      onChange={(event) => select(event.target.value)}
      className="max-w-56 truncate rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-ink transition hover:border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
    >
      {cinemas.map(({ id, name }) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
};
