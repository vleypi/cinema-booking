"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toApiError } from "@luch/shared/api";
import { Button, FormError, Icon, ModalFooter, TextField } from "@luch/shared/ui";
import { useForm } from "react-hook-form";
import { MULTIPLIER_LIMITS } from "@/shared/config";
import type { ITimeBand, ITimeBandInput } from "@/entities/time-band";
import { NEW_TIME_BAND_VALUES, SAVE_TIME_BAND_TEXT } from "@/features/save-time-band/constants/save-time-band.constant";
import { useReplaceTimeBands } from "@/features/save-time-band/hooks/useReplaceTimeBands";
import { timeBandFormSchema, type TimeBandFormValues } from "@/features/save-time-band/schemas/time-band-form.schema";
import { buildTimeBandInputs } from "@/features/save-time-band/utils/time-band-list.util";

interface ITimeBandFormProps {
  cinemaId: string;
  timeBands: readonly ITimeBand[];
  timeBand: ITimeBand | null;
  onDone: () => void;
}

export const TimeBandForm = ({ cinemaId, timeBands, timeBand, onDone }: ITimeBandFormProps) => {
  const { mutate: replace, isPending, variables } = useReplaceTimeBands(cinemaId);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TimeBandFormValues>({
    resolver: zodResolver(timeBandFormSchema),
    defaultValues: timeBand ? { name: timeBand.name, startsAt: timeBand.startsAt, multiplier: timeBand.multiplier } : NEW_TIME_BAND_VALUES,
  });
  const isRemoving = isPending && (variables?.length ?? 0) < timeBands.length;

  const submit = (band: ITimeBandInput | null) =>
    replace(buildTimeBandInputs(timeBands, timeBand?.id ?? null, band), {
      onSuccess: onDone,
      onError: (error) => {
        const { message, fieldErrors } = toApiError(error);
        setError("root.server", { message: Object.values(fieldErrors).flat().join(". ") || message });
      },
    });

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      <TextField label={SAVE_TIME_BAND_TEXT.name} hint={SAVE_TIME_BAND_TEXT.nameHint} error={errors.name?.message} {...register("name")} />
      <TextField label={SAVE_TIME_BAND_TEXT.startsAt} type="time" hint={SAVE_TIME_BAND_TEXT.startsAtHint} error={errors.startsAt?.message} {...register("startsAt")} />
      <TextField
        label={SAVE_TIME_BAND_TEXT.multiplier}
        type="number"
        min={MULTIPLIER_LIMITS.step}
        max={MULTIPLIER_LIMITS.max}
        step={MULTIPLIER_LIMITS.step}
        hint={SAVE_TIME_BAND_TEXT.multiplierHint}
        error={errors.multiplier?.message}
        {...register("multiplier", { valueAsNumber: true })}
      />
      <FormError message={errors.root?.server?.message} />
      <ModalFooter>
        {timeBand && (
          <Button variant="danger" className="px-3" isLoading={isRemoving} disabled={isPending} onClick={() => submit(null)}>
            <Icon name="trash" className="size-4" />
            {SAVE_TIME_BAND_TEXT.remove}
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={onDone} disabled={isPending}>
            {SAVE_TIME_BAND_TEXT.cancel}
          </Button>
          <Button type="submit" isLoading={isPending && !isRemoving}>
            {timeBand ? SAVE_TIME_BAND_TEXT.save : SAVE_TIME_BAND_TEXT.create}
          </Button>
        </div>
      </ModalFooter>
    </form>
  );
};
