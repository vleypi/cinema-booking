"use client";

import { Icon } from "@luch/shared/ui";
import { useId } from "react";
import { FilmPoster } from "@/entities/film";
import { POSTER_MIME_TYPES, SAVE_FILM_TEXT } from "@/features/save-film/constants/save-film.constant";
import { useFilePreview } from "@/features/save-film/hooks/useFilePreview";

interface IPosterPickerProps {
  title: string;
  currentUrl: string | null;
  value: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}

export const PosterPicker = ({ title, currentUrl, value, error, onChange }: IPosterPickerProps) => {
  const id = useId();
  const previewUrl = useFilePreview(value);
  const shownUrl = previewUrl ?? currentUrl;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-gray-700 uppercase">{SAVE_FILM_TEXT.poster}</span>
      <FilmPoster src={shownUrl} title={title} className="w-full" />
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 has-focus-visible:ring-2 has-focus-visible:ring-brand"
      >
        <Icon name="photo" className="size-4" />
        {shownUrl ? SAVE_FILM_TEXT.replacePoster : SAVE_FILM_TEXT.choosePoster}
        <input
          id={id}
          type="file"
          accept={POSTER_MIME_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : <p className="text-xs text-gray-500">{SAVE_FILM_TEXT.posterHint}</p>}
    </div>
  );
};
