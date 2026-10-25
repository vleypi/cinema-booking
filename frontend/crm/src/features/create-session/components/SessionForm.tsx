"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@luch/shared/lib";
import { Button, FormError, SelectField, TextField } from "@luch/shared/ui";
import { useForm, useWatch } from "react-hook-form";
import { formatRubles } from "@/shared/lib";
import { EmptyState } from "@/shared/ui";
import { FILM_TEXT, type IFilm } from "@/entities/film";
import type { IHall } from "@/entities/hall";
import { SESSION_FORMATS } from "@/entities/session";
import { CREATE_SESSION_TEXT, SESSION_FORMAT_OPTIONS } from "@/features/create-session/constants/create-session.constant";
import { useCreateSession } from "@/features/create-session/hooks/useCreateSession";
import { sessionFormSchema, type SessionFormValues } from "@/features/create-session/schemas/session-form.schema";

interface ISessionFormProps {
  cinemaId: string;
  date: string;
  films: readonly IFilm[];
  halls: readonly IHall[];
  onDone: (date: string) => void;
  onCancel: () => void;
}

const DEFAULT_TIME = "18:00";

export const SessionForm = ({ cinemaId, date, films, halls, onDone, onCancel }: ISessionFormProps) => {
  const { mutate: create, isPending } = useCreateSession(cinemaId);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: { filmId: films[0]?.id ?? "", hallId: halls[0]?.id ?? "", date, time: DEFAULT_TIME, format: SESSION_FORMATS[0], basePrice: "" },
  });
  const hallId = useWatch({ control, name: "hallId" });
  const hall = halls.find(({ id }) => id === hallId);

  if (films.length === 0) return <EmptyState icon="film" title={CREATE_SESSION_TEXT.noFilmsTitle} description={CREATE_SESSION_TEXT.noFilmsDescription} />;
  if (halls.length === 0) return <EmptyState icon="seats" title={CREATE_SESSION_TEXT.noHallsTitle} description={CREATE_SESSION_TEXT.noHallsDescription} />;

  const onSubmit = (values: SessionFormValues) =>
    create(values, { onSuccess: () => onDone(values.date), onError: (error) => applyServerErrors(error, setError) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <SelectField
        label={CREATE_SESSION_TEXT.film}
        options={films.map(({ id, title, durationMinutes }) => ({ value: id, label: `${title} · ${durationMinutes} ${FILM_TEXT.minutes}` }))}
        error={errors.filmId?.message}
        {...register("filmId")}
      />
      <SelectField
        label={CREATE_SESSION_TEXT.hall}
        options={halls.map(({ id, name, format }) => ({ value: id, label: `${name} · ${format}` }))}
        error={errors.hallId?.message}
        {...register("hallId")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={CREATE_SESSION_TEXT.date} type="date" error={errors.date?.message} {...register("date")} />
        <TextField label={CREATE_SESSION_TEXT.time} type="time" hint={CREATE_SESSION_TEXT.timeHint} error={errors.time?.message} {...register("time")} />
        <SelectField label={CREATE_SESSION_TEXT.format} options={SESSION_FORMAT_OPTIONS} error={errors.format?.message} {...register("format")} />
        <TextField
          label={CREATE_SESSION_TEXT.basePrice}
          type="number"
          min={0}
          step={10}
          hint={hall ? `${CREATE_SESSION_TEXT.hallPrice}: ${formatRubles(hall.basePrice)}` : CREATE_SESSION_TEXT.basePriceHint}
          error={errors.basePrice?.message}
          {...register("basePrice")}
        />
      </div>
      <FormError message={errors.root?.server?.message} />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          {CREATE_SESSION_TEXT.cancel}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {CREATE_SESSION_TEXT.create}
        </Button>
      </div>
    </form>
  );
};
