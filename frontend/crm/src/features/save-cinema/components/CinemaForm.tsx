"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "@luch/shared/lib";
import { Button, CheckboxField, FormError, SelectField, TextField } from "@luch/shared/ui";
import { useForm } from "react-hook-form";
import type { ICinema } from "@/entities/cinema";
import { NEW_CINEMA_VALUES, SAVE_CINEMA_TEXT, TIMEZONE_OPTIONS } from "@/features/save-cinema/constants/save-cinema.constant";
import { useSaveCinema } from "@/features/save-cinema/hooks/useSaveCinema";
import { cinemaFormSchema, type CinemaFormValues } from "@/features/save-cinema/schemas/cinema-form.schema";

interface ICinemaFormProps {
  cinema: ICinema | null;
  onDone: () => void;
}

const toFormValues = ({ name, slug, address, timezone, opensAt, closesAt, cleaningBreakMinutes, isPublished }: ICinema): CinemaFormValues => ({
  name,
  slug,
  address,
  timezone,
  opensAt,
  closesAt,
  cleaningBreakMinutes,
  isPublished,
});

export const CinemaForm = ({ cinema, onDone }: ICinemaFormProps) => {
  const { mutate: save, isPending } = useSaveCinema(cinema?.id ?? null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CinemaFormValues>({ resolver: zodResolver(cinemaFormSchema), defaultValues: cinema ? toFormValues(cinema) : NEW_CINEMA_VALUES });

  const onSubmit = (values: CinemaFormValues) => save(values, { onSuccess: onDone, onError: (error) => applyServerErrors(error, setError) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField label={SAVE_CINEMA_TEXT.name} error={errors.name?.message} {...register("name")} />
      <TextField label={SAVE_CINEMA_TEXT.slug} hint={SAVE_CINEMA_TEXT.slugHint} error={errors.slug?.message} {...register("slug")} />
      <TextField label={SAVE_CINEMA_TEXT.address} error={errors.address?.message} {...register("address")} />
      <SelectField label={SAVE_CINEMA_TEXT.timezone} options={TIMEZONE_OPTIONS} error={errors.timezone?.message} {...register("timezone")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={SAVE_CINEMA_TEXT.opensAt} type="time" error={errors.opensAt?.message} {...register("opensAt")} />
        <TextField
          label={SAVE_CINEMA_TEXT.closesAt}
          type="time"
          hint={SAVE_CINEMA_TEXT.closesAtHint}
          error={errors.closesAt?.message}
          {...register("closesAt")}
        />
      </div>
      <TextField
        label={SAVE_CINEMA_TEXT.cleaningBreak}
        type="number"
        min={0}
        error={errors.cleaningBreakMinutes?.message}
        {...register("cleaningBreakMinutes", { valueAsNumber: true })}
      />
      <CheckboxField label={SAVE_CINEMA_TEXT.isPublished} description={SAVE_CINEMA_TEXT.isPublishedHint} {...register("isPublished")} />
      <FormError message={errors.root?.server?.message} />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          {SAVE_CINEMA_TEXT.cancel}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {cinema ? SAVE_CINEMA_TEXT.save : SAVE_CINEMA_TEXT.create}
        </Button>
      </div>
    </form>
  );
};
