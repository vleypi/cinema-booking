"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toApiError } from "@luch/shared/api";
import { applyServerErrors } from "@luch/shared/lib";
import { Button, CheckboxField, FormError, Icon, SelectField, TextAreaField, TextField } from "@luch/shared/ui";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmModal } from "@/shared/ui";
import { getPosterUrl, type IFilm } from "@/entities/film";
import { PosterPicker } from "@/features/save-film/components/PosterPicker";
import { AGE_RATING_OPTIONS, FILM_STATUS_OPTIONS, SAVE_FILM_TEXT } from "@/features/save-film/constants/save-film.constant";
import { useRemoveFilm } from "@/features/save-film/hooks/useRemoveFilm";
import { useSaveFilm } from "@/features/save-film/hooks/useSaveFilm";
import { filmFormSchema, type FilmFormValues } from "@/features/save-film/schemas/film-form.schema";
import { NEW_FILM_VALUES, toFilmFormValues } from "@/features/save-film/utils/film-form.util";

const SERVER_FIELD_ALIASES = { file: "poster" } as const;

interface IFilmFormProps {
  film: IFilm | null;
  onDone: () => void;
}

export const FilmForm = ({ film, onDone }: IFilmFormProps) => {
  const { mutate: save, isPending } = useSaveFilm(film?.id ?? null);
  const removal = useRemoveFilm();
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FilmFormValues>({ resolver: zodResolver(filmFormSchema), defaultValues: film ? toFilmFormValues(film) : NEW_FILM_VALUES });

  const onSubmit = (values: FilmFormValues) =>
    save(values, { onSuccess: onDone, onError: (error) => applyServerErrors(error, setError, SERVER_FIELD_ALIASES) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <Controller
          control={control}
          name="poster"
          render={({ field, fieldState }) => (
            <PosterPicker
              title={film?.title ?? SAVE_FILM_TEXT.poster}
              currentUrl={getPosterUrl(film?.posterFileId ?? null)}
              value={field.value}
              error={fieldState.error?.message}
              onChange={field.onChange}
            />
          )}
        />
        <div className="flex flex-col gap-4">
          <TextField label={SAVE_FILM_TEXT.title} autoFocus error={errors.title?.message} {...register("title")} />
          <TextField label={SAVE_FILM_TEXT.genre} error={errors.genre?.message} {...register("genre")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label={SAVE_FILM_TEXT.ageRating} options={AGE_RATING_OPTIONS} error={errors.ageRating?.message} {...register("ageRating")} />
            <TextField
              label={SAVE_FILM_TEXT.durationMinutes}
              type="number"
              min={1}
              error={errors.durationMinutes?.message}
              {...register("durationMinutes", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
      <TextAreaField label={SAVE_FILM_TEXT.description} error={errors.description?.message} {...register("description")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={SAVE_FILM_TEXT.releaseDate} type="date" error={errors.releaseDate?.message} {...register("releaseDate")} />
        <SelectField
          label={SAVE_FILM_TEXT.status}
          options={FILM_STATUS_OPTIONS}
          hint={SAVE_FILM_TEXT.statusHint}
          error={errors.status?.message}
          {...register("status")}
        />
      </div>
      <TextField
        label={SAVE_FILM_TEXT.trailerUrl}
        type="url"
        hint={SAVE_FILM_TEXT.trailerUrlHint}
        error={errors.trailerUrl?.message}
        {...register("trailerUrl")}
      />
      <CheckboxField label={SAVE_FILM_TEXT.isPremiere} description={SAVE_FILM_TEXT.isPremiereHint} {...register("isPremiere")} />
      <FormError message={errors.root?.server?.message} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {film && (
          <Button variant="danger" className="px-3" onClick={() => setIsConfirmingRemoval(true)} disabled={isPending}>
            <Icon name="trash" className="size-4" />
            {SAVE_FILM_TEXT.remove}
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={onDone} disabled={isPending}>
            {SAVE_FILM_TEXT.cancel}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {film ? SAVE_FILM_TEXT.save : SAVE_FILM_TEXT.create}
          </Button>
        </div>
      </div>
      {film && (
        <ConfirmModal
          isOpen={isConfirmingRemoval}
          title={SAVE_FILM_TEXT.removeTitle}
          description={SAVE_FILM_TEXT.removeDescription}
          confirmText={SAVE_FILM_TEXT.remove}
          isPending={removal.isPending}
          error={removal.error ? toApiError(removal.error).message : undefined}
          onConfirm={() => removal.mutate(film.id, { onSuccess: onDone })}
          onClose={() => {
            removal.reset();
            setIsConfirmingRemoval(false);
          }}
        />
      )}
    </form>
  );
};
